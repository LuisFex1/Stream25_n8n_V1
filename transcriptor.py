import sys
import os
import speech_recognition as sr
from pydub import AudioSegment
import io

def convertir_a_wav_en_memoria(ruta_audio):
    audio = AudioSegment.from_file(ruta_audio)
    cortado = False
    if len(audio) > 60000:
        audio = audio[:60000]
        cortado = True
    wav_io = io.BytesIO()
    audio.export(wav_io, format="wav")
    wav_io.seek(0)
    return wav_io, cortado

def convertir_desde_stdin():
    audio_bytes = sys.stdin.buffer.read()
    audio = AudioSegment.from_file(io.BytesIO(audio_bytes))
    cortado = False
    if len(audio) > 60000:
        audio = audio[:60000]
        cortado = True
    wav_io = io.BytesIO()
    audio.export(wav_io, format="wav")
    wav_io.seek(0)
    return wav_io, cortado

def transcribir(wav_io):
    r = sr.Recognizer()
    with sr.AudioFile(wav_io) as source:
        audio = r.record(source)
    try:
        return r.recognize_google(audio, language="es-ES")
    except sr.UnknownValueError:
        return "[ERROR] No se pudo entender el audio"
    except sr.RequestError:
        return "[ERROR] Fallo al conectar con Google Speech"

def main():
    try:
        cortado = False
        if len(sys.argv) == 2 and sys.argv[1] == '--stdin':
            wav_io, cortado = convertir_desde_stdin()
        elif len(sys.argv) >= 2:
            ruta = sys.argv[1]
            if not os.path.exists(ruta):
                print("[ERROR] El archivo no existe")
                return
            wav_io, cortado = convertir_a_wav_en_memoria(ruta)
        else:
            print("[ERROR] Debes proporcionar la ruta del audio o usar --stdin")
            return

        resultado = transcribir(wav_io)

        if cortado and not resultado.startswith("[ERROR]"):
            resultado += " [⚠️ Audio recortado a 60 segundos]"

        print(resultado)

    except Exception as e:
        print(f"[ERROR] {str(e)}")

if __name__ == "__main__":
    main()
