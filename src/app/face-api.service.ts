import { Injectable, EventEmitter } from '@angular/core';
import * as faceapi from 'face-api.js';

@Injectable({
  providedIn: 'root'
})
export class FaceApiService {
  public global : any;
  private modelosACargar = [
    //Cargamos los modelos para la detección de objetos en imágenes y vídeos en tiempo real.
    faceapi.nets.ssdMobilenetv1.loadFromUri('/assets/models'),
    //Cargamos los modelos para los puntos de referencia(Para entender que es ojo,nairz,boca)
    faceapi.nets.faceLandmark68Net.loadFromUri('/assets/models'),
    //Cargamos los modelos para el reconocimiento facial
    faceapi.nets.faceRecognitionNet.loadFromUri('/assets/models'),
    //Cargamos los modelos para el reconocimiento de expresiones
    faceapi.nets.faceExpressionNet.loadFromUri('/assets/models')
  ]

  respuestaModelos: EventEmitter<any> = new EventEmitter<any>();

  constructor() { 
    this.global = faceapi;
    this.cargarModelos();
  }

  public cargarModelos = ()=>{
    //Esta promesa sirve para asegurarnos que se carguen los modelos
   Promise.all(this.modelosACargar).then(()=>{
    console.log('Modelos Cargados!!');
    this.respuestaModelos.emit(true);
   });
  };

}
