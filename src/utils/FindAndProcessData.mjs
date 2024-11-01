import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import pTimeout from "p-timeout";
//Task queue to manage process concurrency
const queue = [];
let running = 0;
const MAX_CONCURRENT_TASKS = 2;

//Function to execute the next task in the queue
const runNext = async () => {
  //If the queue is empty or maximum tasks are already running, do nothing
  if (queue.length === 0 || running >= MAX_CONCURRENT_TASKS) return;

  //Remove the first task from the queue
  const task = queue.shift();
  running++;
  try {
    await task(); //Execute the task
  } catch (error) {
    console.error("Error al ejecutar la tarea:", error);
  } finally {
    running--;
    runNext(); //Execute the next task in the queue
  }
};

//Function to add tasks to the queue and execute them
const addToQueue = (task) => {
  queue.push(task);
  runNext();
};

//Function to navigate to a URL with multiple retries in case of failure
const navigateWithRetry = async (page, url, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      //Try to navigate to the URL with a timeout of 60 seconds
      await pTimeout(page.goto(url, { waitUntil: "networkidle0", timeout: 60000 }), 60000);
      return;//If the navigation is successful, exit the loop
    } catch (error) {
      console.error(`Error al navegar a ${url}: ${error.message}`);
      if (i === retries - 1) throw error; //If it is the last attempt, throw the error
    }
  }
};

//Function to search for text within the web page with retries
const findTextWithRetry = async (page, text, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    console.log(`Buscando el texto "${text}" en la página...`);

  //Search for text in the shadow DOM of a specific component
    const found = await page.evaluate((searchText) => {
      const shadowRoot = document.querySelector("explorador-archivos-component")?.shadowRoot;
      if (!shadowRoot) return false;

     //Go through the rows looking for the text
      const rows = shadowRoot.querySelectorAll("tr");
      for (const row of rows) {
        const paragraph = row.querySelector("p");
        if (paragraph && paragraph.textContent.includes(searchText)) {
          paragraph.click();//Click on the element if it is found
          return { found: true };
        }
      }
      return { found: false };
    }, text);

    if (found.found) {
      return found; // Si se encuentra el texto, salir de la función
    }

    // Esperar 2 segundos antes de reintentar
    console.log(`Texto "${text}" no encontrado. Esperando 2 segundos antes de reintentar...`);
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  //If not found after several attempts, show error
  console.error(`Texto "${text}" no encontrado después de varios intentos.`);
  return { found: false };
};

//Main function to search and process data on a web page
const findAndProcessData = async (url, searchText, inputText, clickText, fileName) => {
  let browser;
  let filePath = "";

  try {
    //Start browser in headless mode (without graphical interface)
    console.log("Iniciando el navegador...");
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    console.log("Navegador iniciado.");

    const page = await browser.newPage();
    const pageTarget = page.target();

    //Handle opening of new tabs
    const processNewTab = new Promise((resolve) => {
      browser.on("targetcreated", async (target) => {
        if (target.type() === "page" && target !== pageTarget) {
          const newPage = await target.page();
          try {
            //Wait for the new tab to load completely
            await pTimeout(newPage.waitForNetworkIdle({ timeout: 60000 }), 60000);

           //Get all text on the page
            const pageData = await newPage.evaluate(() => document.body.innerText);

          //Regular expression to capture specific data
            const regex = /^("ZIPA[^"]*")([,\d]*)/gm;
            const matches = [];
            let match;

         //Find all matches
            while ((match = regex.exec(pageData)) !== null) {
              matches.push(match[0]);
            }

            //Save matches to a file
            if (matches.length > 0) {
              const __dirname = path.dirname(new URL(import.meta.url).pathname);
              filePath = path.join(__dirname, fileName);
              fs.writeFileSync(filePath, matches.join("\n"));
            }
          } catch (error) {
            console.error("Error al procesar la nueva pestaña:", error);
          } finally {
            await newPage.close();
            resolve();
          }
        }
      });
    });

   //Navigate to URL with retries
    await navigateWithRetry(page, url);

   //Find text on the page
    const found = await findTextWithRetry(page, searchText);

 //If text is found, perform additional actions
    if (found.found) {
      //Clean and prepare search field
      await page.evaluate((text) => {
        const shadowRoot = document.querySelector("explorador-archivos-component")?.shadowRoot;
        if (!shadowRoot) return;

        const inputContainer = shadowRoot.querySelector(".input-nombre");
        const input = inputContainer?.querySelector('input[placeholder="Buscar archivo por nombre"]');
        if (input) {
          input.focus();
          input.value = "";
          input.dispatchEvent(new Event("input", { bubbles: true }));
        }
      }, inputText);

      //Write text in the search field
      await page.keyboard.type(inputText);

//Wait and click on specific element
      const clickFound = await pTimeout(page.waitForFunction((text) => {
        const shadowRoot = document.querySelector("explorador-archivos-component")?.shadowRoot;
        if (!shadowRoot) return false;

        const rows = shadowRoot.querySelectorAll("tr");
        for (const row of rows) {
          const paragraph = row.querySelector("p");
          if (paragraph && paragraph.textContent.includes(text)) {
            paragraph.click();
            return true;
          }
        }
        return false;
      }, {}, clickText), 60000);

     //Handle error if unclickable
      if (!clickFound) {
        console.error(`No se pudo hacer clic en "${clickText}" después del tiempo de espera.`);
      }

      //Wait for the network to be idle
      await pTimeout(page.waitForNetworkIdle(), 60000);
    }

  //Wait for the new tab to be processed
    await processNewTab;

    return filePath;
  } catch (error) {
    console.error("Error en findAndProcessData:", error);
    return null;
  } finally {
    //Close the browser at the end
    if (browser) await browser.close();
  }
};

//Export the function for use in other modules
export default findAndProcessData;