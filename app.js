const express = require('express');
const { spawn } = require('child_process');
const fs = require('fs-extra');
const path = require('path');
let cors = require('cors')

const app = express();
app.use(express.json());
app.use(cors())


const javaFilePath = path.join(__dirname, 'RtfToJson.java');
const outputFilePath = path.join(__dirname, 'temp', 'Data.txt');

// Rota para enviar o conteúdo RTF em JSON
app.post('/convert', (req, res) => {
  const { rtfContent } = req.body;

  const tempFilePath = path.join(__dirname, 'temp', 'input.rtf');
  fs.writeFile(tempFilePath, rtfContent, (err) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Erro ao salvar o conteúdo RTF temporário.' });
    } else {
      // Comando para compilar e executar o arquivo Java
      const javaProcess = spawn('javac', [javaFilePath]);

      javaProcess.on('error', (err) => {
        console.error('Erro ao compilar o arquivo Java:', err);
        res.status(500).json({ error: 'Erro ao compilar o arquivo Java.' });
      });

      javaProcess.on('close', (code) => {
        if (code === 0) {
          // Arquivo Java compilado com sucesso, agora podemos executá-lo
          const javaExecutionProcess = spawn('java', ['-cp', path.dirname(javaFilePath), 'RtfToJson', tempFilePath]);

          javaExecutionProcess.on('error', (err) => {
            console.error('Erro durante a execução do processo Java:', err);
            res.status(500).json({ error: 'Erro ao executar o arquivo Java.' });
          });

          let javaOutput = '';

          javaExecutionProcess.stdout.on('data', (data) => {
            javaOutput += data.toString('utf-8');
          });

          javaExecutionProcess.on('close', (code) => {
            if (code === 0) {
              // Ler o arquivo de saída gerado pelo Java
              fs.readFile(outputFilePath, 'utf-8', (err, data) => {
                if (err) {
                  console.error(err);
                  res.status(500).json({ error: 'Erro ao ler o arquivo de saída.' });
                } else {
                  // Enviar o conteúdo como resposta da API
                  res.send({ javaOutput, convertedText: data });
                }

                // Remover os arquivos temporários após a leitura
                fs.remove(tempFilePath, (err) => {
                  if (err) {
                    console.error(err);
                  }
                });
                fs.remove(outputFilePath, (err) => {
                  if (err) {
                    console.error(err);
                  }
                });
              });
            } else {
              res.status(500).json({ error: 'Erro ao executar o arquivo Java.' });
            }
          });
        } else {
          res.status(500).json({ error: 'Erro ao compilar o arquivo Java.' });
        }
      });
    }
  });
});

const port = 3000;
app.listen(port, () => {
  console.log(`API rodando em http://localhost:${port}`);
});