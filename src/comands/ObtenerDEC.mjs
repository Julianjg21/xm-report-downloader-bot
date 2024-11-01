import fs from "fs";
import findAndProcessData from "../utils/FindAndProcessData.mjs";
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';

//-UTC Plugin: Convert and normalize dates to the Coordinated Universal Time standard
//-Timezone Plugin: Transform dates considering global time differences
dayjs.extend(utc);   //Standardize dates to UTC
dayjs.extend(timezone);  //Convert between time zones respecting time changes

// Función para manejar los comandos obtener_dDEC y obtener_rDEC
const obtenerDEC = async (ctx) => {
  try {
    //Configure Colombia time zone
    dayjs.tz.setDefault('America/Bogota');

  //Get date in Colombia time zone
    const colombiaDate = dayjs().tz();

    const year = colombiaDate.year();
    const month = colombiaDate.format('MM');
    const day = colombiaDate.format('DD');

    const formattedDate = colombiaDate.format('YYYY-MM-DD');
    const searchText = colombiaDate.format('YYYY-MM');

    let url, inputText, clickText, fileName;

//Configuration based on command
    if (ctx.message.text === "/obtener_dDEC") {
      url = "https://www.xm.com.co/generaci%C3%B3n/informes-despacho/despacho-programado";
      inputText = "dDEC";
      clickText = `dDEC${month}${day}`;
      fileName = `dDEC_zipa_${formattedDate}.txt`;
      ctx.reply("Espera un momento, estamos generando tu informe de Despacho programado.");
    } else {
      url = "https://www.xm.com.co/operaci%C3%B3n/redespacho-y-coordinaci%C3%B3n/redespacho-diario";
      inputText = "rDEC";
      clickText = `rDEC${month}${day}`;
      fileName = `rDEC_zipa_${formattedDate}.txt`;
      ctx.reply("Espera un momento, estamos generando tu informe de Redespacho diario.");
    }

 //Call the findAndProcessData function and send the resulting file
    const filePath = await findAndProcessData(url, searchText, inputText, clickText, fileName);
    if (filePath && fs.existsSync(filePath)) {
      await ctx.replyWithDocument({ source: filePath });
    } else {
      ctx.reply("Archivo no encontrado o error al generar el archivo, inténtalo de nuevo.");
    }
  } catch (error) {
    console.error("Error durante la ejecución del comando:", error);
    ctx.reply("Hubo un error procesando tu solicitud, inténtalo de nuevo.");
  }

  ctx.reply("Usa /start si necesitas usar nuestro menú de nuevo. Fue un gusto haberte ayudado.");
};

export default obtenerDEC;