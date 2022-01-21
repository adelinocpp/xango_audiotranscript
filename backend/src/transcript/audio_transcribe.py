#!/usr/bin/env python3
# pyright: reportMissingImports=false, reportUnusedVariable=warning, reportUntypedBaseClass=error
import json
import speech_recognition as sr  
# import json
import os
import pathlib
import subprocess
# -------------------------------
from utils.filemisc import readFilesFromPath
# -------------------------------
import sys
import requests

class AudioData:
  def __init__(self, audioFullPath):
    self.fullpath = audioFullPath
    self.basename = os.path.basename(audioFileOutput)
    cmdString = 'mediainfo --Inform=\"Audio;%Format%\" ' + audioFileInput
    returnStr =  subprocess.Popen(cmdString, shell=True, stdout=subprocess.PIPE).stdout
    self.codec =  returnStr.read().decode()[0:-1]
    cmdString = 'mediainfo --Inform=\"General;%FileSize%\" ' + audioFileInput
    returnStr =  subprocess.Popen(cmdString, shell=True, stdout=subprocess.PIPE).stdout
    self.fileSize =  returnStr.read().decode()[0:-1]
    cmdString = 'mediainfo --Inform=\"General;%Duration%\" ' + audioFileInput
    returnStr =  subprocess.Popen(cmdString, shell=True, stdout=subprocess.PIPE).stdout
    self.duration =  returnStr.read().decode()[0:-1]
    cmdString = 'mediainfo --Inform=\"Audio;%SamplingRate%\" ' + audioFileInput
    returnStr =  subprocess.Popen(cmdString, shell=True, stdout=subprocess.PIPE).stdout
    self.fs =  returnStr.read().decode()[0:-1]
  # def getFileSize(self):
  #   tempFileSeize = self.fileSize
  #   return self.fileSize
# --- Aloca as variaveis ------------------------------------------------------
audioFileInput = sys.argv[1]
transcripID = sys.argv[2]
audioFileOutput = sys.argv[3]
userId = sys.argv[4]
serverPass = "*qjpxR8crU7ZfBeL"
httpPort="9443"
hostName="localhost"
tempDir = os.path.abspath("./.temp/")
# --- Prepara o arquivo de LOG ------------------------------------------------
logFileName = os.path.dirname(audioFileOutput) + "/LOG_" + os.path.basename(audioFileOutput) + ".txt"
fRunReport = open(logFileName, 'wt')
fRunReport.write('Parametros de entrada:\n')
for idx, selArg in enumerate(sys.argv):
  fRunReport.write('Arg {:02}: {:}\n'.format(idx, selArg))
fRunReport.write('transcripID: {:}\n'.format(transcripID))
# --- Verifica o codec do arquivo de entrada ----------------------------------
inputAudioData = AudioData(audioFileInput)
# cmdString = 'mediainfo --Inform=\"Audio;%Format%\" ' + audioFileInput
# fRunReport.write(cmdString+ "\n")
# getCodec =  subprocess.Popen(cmdString, shell=True, stdout=subprocess.PIPE).stdout
# codec =  getCodec.read().decode()[0:-1]
fRunReport.write("Codec: " + inputAudioData.codec + ". PCM: {:}\n".format(inputAudioData.codec == "PCM"))
# --- Prepara o passe para obter p token de devolucao -------------------------
requestAddress = 'http://{}:{}/encript?A={}&B={}'.format(hostName,httpPort,serverPass,userId)
fRunReport.write(requestAddress+ "\n")
r = requests.get(requestAddress).json()
EncPass = r["requestData"]["encript"]
fRunReport.write("encript: {}\n".format(EncPass))
# --- Solicita o tokem de devolucao -------------------------------------------
requestAddress = 'http://{}:{}/get_token_transcript'.format(hostName,httpPort)
fRunReport.write(requestAddress+ "\n")
r = requests.post(requestAddress, data ={'fileId':userId,'pass':EncPass}).json()
sendToken = r["tokenReturn"]["accessToken"]
fRunReport.write("Token: {}\n".format(sendToken))


removeFile = False
if (not (inputAudioData.codec == "PCM")):
  isdir = os.path.isdir(tempDir)
  if (not os.path.isdir(tempDir)):
    os.makedirs(tempDir)
  tempFileName = tempDir + 'temp.wav'
  convertFilecmd = 'ffmpeg -i ' + audioFileInput + ' -acodec pcm_s16le ' + tempFileName + ' -y -loglevel error -hide_banner'
  subprocess.Popen(convertFilecmd, shell=True, stdout=subprocess.PIPE).wait()
  removeFilecmd = 'rm ' + tempFileName
  removeFile = True
  FileToOpen = tempFileName
else:
  FileToOpen = audioFileInput

fOutputTranscript = open(audioFileOutput, 'wt')

SpeechRec = sr.Recognizer()
with sr.AudioFile(FileToOpen) as source:
  audio = SpeechRec.record(source)  # read the entire audio file
  try:
      RESULT = SpeechRec.recognize_google(audio, language='pt-BR', show_all=False)
      fOutputTranscript.write("Nome do arquivo: {}.\n".format(os.path.basename(audioFileInput)[33:]))
      fOutputTranscript.write("Duração: {} ms.\n".format(inputAudioData.duration))
      fOutputTranscript.write("Tamanho: {} bytes.\n".format(inputAudioData.fileSize))
      # RESULT_json = RESULT.json()
      json_mylist = json.dumps(RESULT, separators=(',', ':'), ensure_ascii=False)
      fOutputTranscript.write(json_mylist[1:-1])
      fRunReport.write("Google Speech Recognition diz: {}.\n".format(RESULT))
      statusReturn="SUCCESS"
  except sr.UnknownValueError:
      fRunReport.write("Google Speech Recognition não compreendeu o áudio.\n")
      fOutputTranscript.write("O sistema de reconhecimento de fala não compreendeu o áudio.\n")
      statusReturn="FAILED_TRANSCRIPT"
  except sr.RequestError as e:
      fRunReport.write("Não foi possivel requisitar o resultado do Google Speech Recognition. Erro: {0}\n".format(e))
      fOutputTranscript.write("Não foi possivel obter o resultado do sistema de reconhecimento de fala.\n")
      statusReturn="FAILED_ACCESS"
  if (removeFile):
      subprocess.Popen(removeFilecmd, shell=True, stdout=subprocess.PIPE).wait()


# --- envia o resultado -------------------------------------------------------
requestAddress = 'http://{}:{}/return_transcrip'.format(hostName,httpPort)
fRunReport.write(requestAddress+ "\n")
r = requests.post(requestAddress, data ={'tokennum':sendToken,'hash_md5':"testhashmd5", 'status':statusReturn, 'transcript_id':transcripID}).json()
json_mylist = json.dumps(r, separators=(',', ':'), ensure_ascii=False)
fRunReport.write(json_mylist)
# --- Fecha os arquivos de LOG e de transcricao -------------------------------
fOutputTranscript.close()
fRunReport.close()
sys.exit("MODO DE DEPURAÇÃO: Fim do script")
# -----------------------------------------------------------------------------
    # if not (codec == "PCM"):
    #     tempFileName = 'temp.wav'
    #     convertFilecmd = 'ffmpeg -i ' + FileToOpen + ' temp.wav -y -loglevel error -hide_banner'
    #     subprocess.Popen(convertFilecmd, shell=True, stdout=subprocess.PIPE).wait()
    #     removeFilecmd = 'rm temp.wav'
    #     removeFile = True
    #     FileToOpen = './' + tempFileName
    # else:
    #     FileToOpen = AUDIO_FILE.as_posix()
        
    # with sr.AudioFile(FileToOpen) as source:
    #     audio = r.record(source)  # read the entire audio file
    #     try:
    #         RESULT = r.recognize_google(audio, language='pt-BR', show_all=True)
    #         print("Arquivo:", AUDIO_FILE.as_posix());
    #         print("Google Speech Recognition thinks you said: ")
    #         print(RESULT)
    #         print("")
    #     except sr.UnknownValueError:
    #         print("Google Speech Recognition could not understand audio")
    #         print("")
    #     except sr.RequestError as e:
    #         print("Could not request results from Google Speech Recognition service; {0}".format(e))
    #         print("")
    #     if (removeFile):
    #         subprocess.Popen(removeFilecmd, shell=True, stdout=subprocess.PIPE).wait()

