import { Injectable, EventEmitter } from '@angular/core';
import { FaceApiService } from './face-api.service';
import * as _ from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class VideoService {

  //Emitimos el evento
  respuestaAI : EventEmitter<any> = new EventEmitter<any>();
  constructor(private faceApiService : FaceApiService) { 


  }
  getPuntosReferencia= async(elementoVideo:any)=>{
    //Llamamos nuestra variable global y asignamos el servicio FaceApi
    const {global} = this.faceApiService;
    //Obtenemos el ancho y alto del video
    const{videoWidth, videoHeight} = elementoVideo.nativeElement;
    const tamañoPantalla = {width: videoWidth, height:videoHeight};
    //console.log(tamañoPantalla);
    //Detectamos los puntos de referencia y las expresiones
    const deteccionCara = await global.detectAllFaces(elementoVideo.nativeElement)
      .withFaceLandmarks()
      .withFaceExpressions();
    //console.log(deteccionCara);
    //Puntos de referencia
    const puntosRef = deteccionCara[0].landmarks || null;
    const expresiones = deteccionCara[0].expressions || null;
    //Puntos de referencia de los ojos
    const ojoizqu = puntosRef.getLeftEye();
    const ojoider = puntosRef.getRightEye();
    //console.log(ojoizqu);
    const ojos = {
      //Traemos el primer y ultimo punto de referencia del ojo
      left: [_.head(ojoizqu),_.last(ojoizqu)],
      right: [_.head(ojoider),_.last(ojoider)],
    };
    const redimensionDetec = global.resizeResults(deteccionCara, tamañoPantalla);
    this.respuestaAI.emit({
      redimensionDetec, 
      tamañoPantalla,
      expresiones,
      ojos,
      elementoVideo
    })    
  };
}
