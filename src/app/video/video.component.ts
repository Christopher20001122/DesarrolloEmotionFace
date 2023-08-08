import { Component, ElementRef, Input, OnInit, ViewChild, Renderer2,OnDestroy } from '@angular/core';
import { FaceApiService } from '../face-api.service';
import { VideoService } from '../video.service';

@Component({
  selector: 'app-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.scss']
})
export class VideoComponent implements OnInit, OnDestroy {


  @ViewChild('elementoVideo')elementoVideo: ElementRef;
  @Input() transmision:any;
  @Input() width: number;
  @Input() height: number;
  modelosListos: boolean;
  listaEventos : Array<any> = [];
  sobreLienzo : any;

  constructor(
    private renderer2: Renderer2, 
    private elementRef : ElementRef,
    private faceApiService: FaceApiService,
    private videoService : VideoService
    ){
  }
  ngOnInit(): void {
    this.Eventos();
  }
  ngOnDestroy(): void {
    this.listaEventos.forEach(event => event.unsubscribe());
  }

  Eventos = ()=>{
    const observador1$ = this.faceApiService.respuestaModelos.subscribe(res => {
      //Los modelos ya esta cargados y listos
      this.modelosListos = true;
      this.RevisarCaras();
    });

    const observador2$ = this.videoService.respuestaAI
    //Cada vez que la IA consiga estos valores los emite a VideoComponent
    .subscribe(({redimensionDetec, tamañoPantalla,expresiones,ojos})=>{
      redimensionDetec = redimensionDetec[0]||null;
    //Aqui dibujamos 
    if(redimensionDetec){
      this.DibujarCara(redimensionDetec, tamañoPantalla, ojos);
    }
    });

    this.listaEventos = [observador1$,observador2$]
  };

  DibujarCara = (redimensionDetec, tamañoPantalla, ojos)=>{
    const {global}= this.faceApiService;
    //Vamos a agarra el contexto y limpiar el lienzo
    this.sobreLienzo.getContext('2d').clearRect(0,0,tamañoPantalla.width,tamañoPantalla.height);
    //Dibujar el cuadro para reconocer si es un rostro
    global.draw.drawDetections(this.sobreLienzo,redimensionDetec);
    //Dibujar los puntos de referencia
    //global.draw.drawFaceLandmarks(this.sobreLienzo,redimensionDetec);

  }

  RevisarCaras= ()=>{
    //Se va a ejecutar cada 100milisegundos
    setInterval(async()=>{
      await this.videoService.getPuntosReferencia(this.elementoVideo);
    }, 100);
  };

  PrecargaCompleta(): void {
    //Ya tengo el video cargado entonces lo reproducimos
    this.elementoVideo.nativeElement.play();
    }
    
  VideoReproduciendo():void {
    const {global} = this.faceApiService;
    this.sobreLienzo = global.createCanvasFromMedia(this.elementoVideo.nativeElement);
    this.renderer2.setProperty(this.sobreLienzo,'id','new-lienzo');
    this.renderer2.setStyle(this.sobreLienzo, 'width', '500px');
    this.renderer2.setStyle(this.sobreLienzo, 'height', '500px');; 
    //Se obtiene una captura del video
    this.renderer2.appendChild(this.elementRef.nativeElement,this.sobreLienzo);

    }
}
