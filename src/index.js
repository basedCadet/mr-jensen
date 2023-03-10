import pkg from '@deepgram/sdk';
import dotenv from 'dotenv';
import fs from 'fs';
import venom from 'venom-bot';

dotenv.config();

const { Deepgram } = pkg;
const deepgram = new Deepgram(process.env.DEEPGRAM_API_KEY);

const pathToFile = 'C:/Playground/mr-jensen/audio.mp3';

venom.create({
    session: 'mr-jensen', //name of session
  })
  .then((client) => start(client))
  .catch((error) => {
    console.log(error);
  });

const start = (client) => {
  client.onAnyMessage(async (msg) => {
      if (msg.type === 'ptt') {
        const buffer = await client.decryptFile(msg);
        fs.writeFile("audio.mp3", buffer, (err) => {
            if (err) {
                return err;
            }
            deepgram.transcription.preRecorded(
                { buffer: fs.readFileSync(pathToFile), mimetype: 'audio/mp3' },
                { punctuate: true, language: 'pt-BR' },
              )
              .then((transcription) => {
                client.sendText(msg.from, `Olá, sou o Sr. Jensen 🕴🏻, o transcritor de áudio. Obrigado por utilizar meus serviços! \n\nTranscrição: ${transcription.results.channels[0].alternatives[0].transcript}`);
              })
              .catch((err) => {
                console.log(err);
              });
              fs.unlinkSync("audio.mp3");
        });
    }
  });
}
