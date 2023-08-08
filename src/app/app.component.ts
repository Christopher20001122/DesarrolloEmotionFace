import { Component,OnInit, OnDestroy, Renderer2, ElementRef } from '@angular/core';
import { VideoService } from './video.service';
import { FaceApiService } from './face-api.service';
import * as _ from 'lodash';
import { Router } from '@angular/router';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  public Transmi: any;
  public dimensionVideo : any;
  listaEventos : Array<any> = [];
  sobreLienzo : any;
  listaExpresiones : any [];
  EmocionAlta: { name: string, value: number } = { name: "", value: 0 };
  EmocionAltaCapturada: { name: string, value: number,timestamp: number } | null = null;
  
  constructor(
    private faceApiService : FaceApiService,
    private videoService: VideoService,
    private renderer2 : Renderer2,
    private elementRef: ElementRef,
    private router: Router ){

  }

  ngOnInit(): void { 
    this.Eventos(); 
    this.RevisarMultimedia();
    this.getTamañoCamara();
  }
  ngOnDestroy(): void {
    this.listaEventos.forEach(event => event.unsubscribe());
  }
  emotionToLinksMap: {[emotion: string]: string[] } = {
    'neutral': ['https://vm.tiktok.com/ZM2vMSFWv/', 'https://vm.tiktok.com/ZM2vMPAt4/', 'https://vm.tiktok.com/ZM2vMwN9X/'],
    'happy': ['https://vm.tiktok.com/ZM2vMSFWv/', 'https://vm.tiktok.com/ZM2vMPAt4/', 'https://vm.tiktok.com/ZM2vMwN9X/'],
    'sad': ['https://www.tiktok.com/@cristic2day/video/7208509486116474117?is_from_webapp=1&sender_device=pc&web_id=7226808590254114309', 'https://www.tiktok.com/@psicologamassiel/video/7168614820504210694?is_from_webapp=1&sender_device=pc&web_id=7226808590254114309','https://www.tiktok.com/@juanflorescoach/video/7099508534827699462?is_from_webapp=1&sender_device=pc&web_id=7234710049590756869'],
    'angry': ['https://vm.tiktok.com/ZM2vM7hP9/', 'https://vm.tiktok.com/ZM2vrRjMM/', 'https://www.tiktok.com/@wellbeing_paochacon/video/7121136888366353670?is_from_webapp=1&sender_device=pc&web_id=7234710049590756869'],
    'fearful': ['https://www.tiktok.com/@valentino.growth/video/7151166219058564358?is_from_webapp=1&sender_device=pc&web_id=7234710049590756869', 'https://vm.tiktok.com/ZM2vrvVSS/', 'https://www.tiktok.com/@nicoserna.live/video/7071014620135165189?is_from_webapp=1&sender_device=pc&web_id=7234710049590756869'],
    'disgusted': ['https://vm.tiktok.com/ZM2vhBchh/', 'https://vm.tiktok.com/ZM2vhNo8s/', 'https://vm.tiktok.com/ZM2vroBAn/'],
    'surprised': ['https://www.tiktok.com/@reddit_ec/video/7164577101817859334?q=cosas%20que%20no%20sabias&t=1691466689959', 'https://www.tiktok.com/@mundo_del_misterio/video/7250205150696967429?is_from_webapp=1&sender_device=pc&web_id=7234710049590756869', 'https://www.tiktok.com/@marco_sander/video/7246865088030756101?is_from_webapp=1&sender_device=pc&web_id=7234710049590756869'],
  };
  Eventos = ()=>{
    const observador1$ = this.videoService.respuestaAI
    //Cada vez que la IA consiga estos valores los emite a VideoComponent
    .subscribe(({redimensionDetec, tamañoPantalla,expresiones,elementoVideo})=>{
      redimensionDetec = redimensionDetec[0]||null;
    //Aqui dibujamos 
    if(redimensionDetec){
      this.listaExpresiones = _.map(expresiones,(value,name)=>{
        return {name, value};
      });
      //console.log(this.listaExpresiones);   
      //console.log(expresiones);
      //capturamos el valor con la expresion más alta
      let EmocionAlta = { name: "", value: 0 };
        this.listaExpresiones.forEach(({ name, value }) => {
          if (value > EmocionAlta.value) {
            EmocionAlta = { name, value };       
          }
        });
      //Va crear un liezo apenas detecte una cara
      this.crearLienzoPrevio(elementoVideo);
      this.DibujarCara(redimensionDetec, tamañoPantalla);
      //Comparamos que la emocion sea superior al 95%
      const currentTime = new Date().getTime();
      if (EmocionAlta.value >= 0.95) {
        if (!this.EmocionAltaCapturada || currentTime - this.EmocionAltaCapturada.timestamp >= 15000) {
          this.EmocionAltaCapturada = { ...EmocionAlta, timestamp: currentTime };
      
          const emotionName = EmocionAlta.name;
          const emotionLinks = this.emotionToLinksMap[emotionName];
          if (emotionLinks && emotionLinks.length > 0) {
            const randomIndex = Math.floor(Math.random() * emotionLinks.length);
            const selectedLink = emotionLinks[randomIndex];
            setTimeout(() => {
              window.open(selectedLink, '_blank');
            }, 4000); 
          }
        }
      }
    }
    });

    this.listaEventos = [observador1$]
  };


  DibujarCara = (redimensionDetec, tamañoPantalla)=>{
    //Dibujamos los puntos de referencia en el cuadro 
    if(this.sobreLienzo){
      const {global} = this.faceApiService;
      this.sobreLienzo.getContext('2d').clearRect(0,0,tamañoPantalla.width,tamañoPantalla.height);
      global.draw.drawFaceLandmarks(this.sobreLienzo, redimensionDetec);
    }
  };

  RevisarMultimedia =()=>{
    //Solo se va a ejecutar si detecta fuentes de multimedia 
    if(navigator&&navigator.mediaDevices){
      navigator.mediaDevices.getUserMedia({
        video:true
        //Si es que acepta
      }).then(Stream=> {
        this.Transmi = Stream
        //Si es que no acepta
      }).catch(()=>{
        console.log('<><><>Error permisos denegados<><><>');     
      });
    }else{
      console.log('<><><>Error, no se encontro una Camara<><><>');
      
    }
  };

  //Funcion para tomar el elemento
  getTamañoCamara=()=>{   
    const elementCam: HTMLElement = document.querySelector('.cam');
    //obtenemos el ancho y alto de la camara (bordes)
    const {width, height} = elementCam.getBoundingClientRect();
    this.dimensionVideo = {width, height};
  };

  crearLienzoPrevio = (elementoVideo:any)=>{
    if(!this.sobreLienzo){
      const {global}= this.faceApiService;
      //guardamos la creacion del lienzo si es que no existe un lienzo
      this.sobreLienzo = global.createCanvasFromMedia(elementoVideo.nativeElement);
      this.renderer2.setProperty(this.sobreLienzo, 'id', 'new-lienzo-previo');
      const elementoPrevio = document.querySelector('.canvas-preview');
      this.renderer2.appendChild(elementoPrevio, this.sobreLienzo);
    }

  };
}
