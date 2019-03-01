import { Component, OnInit, ViewChild } from "@angular/core";
import { RouterModule, Routes, ActivatedRoute } from "@angular/router";
import { SocketsService } from "../sockets.service";
import { Subscription } from "rxjs";
import { RootServerService } from "../root-server.service";
import { ConfigService } from "../config.service";

@Component({
  selector: "app-game-screen",
  templateUrl: "./game-screen.component.html",
  styleUrls: ["./game-screen.component.css"]
})
export class GameScreenComponent implements OnInit {
  constructor(
    public route: ActivatedRoute,
    public socket: SocketsService,
    public rootServer: RootServerService,
    public configService: ConfigService
  ) {}

  branchApi: any;
  rootApi: any;

  // Script vars
  scriptName: any;
  script: any;
  socketSubscription: Subscription;
  time: any;

  // Screen triggers
  triggers: any;
  hints: any;
  audio: any;
  video: any;

  // Audio
  audioArray: any; // holds all audio
  startAudio: any;
  endAudio: any;
  hintAudio: any;
  backgroundAudio: any;
  customAudio: any;

  // Screen Elements
  hintText: any;

  // Custom Configs
  customStyles: any;
  hintTextSize: any;

  videoOverrideStyle: any;

  @ViewChild("videoElem") videoElem: any;
  @ViewChild("videoElemOverride") videoElemOverride: any;
  @ViewChild("hintElem") hintElem: any;
  @ViewChild("audioElem") audioElem: any;

  ngOnInit() {
    this.branchApi = this.rootServer.branchApi;
    this.rootApi = this.rootServer.api;
    this.route.paramMap.subscribe(params => {
      this.scriptName = params.get("name");
      console.log(this.scriptName);
      this.getScript(this.scriptName);
      this.getScreenConfig();
    });
    this.socketSubscribe();
  }

  getScreenConfig() {
    let configs = this.configService.screenConfig.configs;
    for (var i = 0; i < configs.length; i++) {
      if (configs[i].name === this.scriptName) {
        this.customStyles = configs[i].style;
      }
    }
    this.hintTextSize = {
      "font-size": "6vw"
    };
  }

  getScript(scriptName: any) {
    this.rootServer.loadScript(scriptName).subscribe(script => {
      this.script = script;
      this.initAudio();
      this.initVideo();
    });
  }

  initAudio() {
    this.startAudio = new Audio();
    this.endAudio = new Audio();
    this.hintAudio = new Audio();
    this.backgroundAudio = new Audio();
    this.customAudio = new Audio();

    for (let trigger of this.script.triggers) {
      if (trigger.audio != "") {
        this.parseAudioType(
          trigger.audio_type,
          trigger.audio,
          trigger.loop_audio
        );
      }
    }

    this.audioArray = new Array();
    this.audioArray.push(this.startAudio);
    this.audioArray.push(this.endAudio);
    this.audioArray.push(this.hintAudio);
    this.audioArray.push(this.backgroundAudio);
    this.audioArray.push(this.customAudio);
  }

  parseAudioType(type, path, loop) {
    let api = this.rootServer.branchApi;
    path = `${api}/${path}`;
    switch (type) {
      case "start":
        this.startAudio = new Audio(path);
        if (loop) this.startAudio.loop = true;
        break;
      case "end":
        this.endAudio = new Audio(path);
        if (loop) this.endAudio.loop = true;
        break;
      case "hint":
        this.hintAudio = new Audio(path);
        if (loop) this.hintAudio.loop = true;
        break;
      case "background":
        this.backgroundAudio = new Audio(path);
        if (loop) this.backgroundAudio.loop = true;
        break;
      case "custom":
        this.customAudio = new Audio(path);
        if (loop) this.customAudio.loop = true;
        break;
      default:
        break;
    }
  }

  initVideo() {
    //For background video
    this.videoElem.nativeElement.setAttribute("width", "100%");
    this.videoElem.nativeElement.setAttribute("height", "100%");
    this.videoElem.nativeElement.setAttribute("type", "video/mp4");

    //For Playing videos over the top
    this.videoElemOverride.nativeElement.setAttribute("width", "100%");
    this.videoElemOverride.nativeElement.setAttribute("height", "100%");
    this.videoElemOverride.nativeElement.setAttribute("type", "video/mp4");
    this.enableVideoOverride(false);
    for (let trigger of this.script.triggers) {
      if (trigger.video != "") {
        if (trigger.video_type == "background") {
          this.playBackgroundVideo(
            trigger.video,
            trigger.loop_video,
            trigger.pause_timer
          );
        }
      }
    }
  }

  enableVideoOverride(show) {
    if (show) {
      this.videoOverrideStyle = {
        "z-index": "2"
      };
    } else {
      this.videoOverrideStyle = {
        display: "none",
        "z-index": "-1000"
      };
    }
  }

  socketSubscribe() {
    this.socketSubscription = this.socket
      .getMessages()
      .subscribe((message: any) => {
        if (message.hasOwnProperty("instance_update")) {
          if (message.instance_update.name === this.scriptName) {
            this.scriptUpdate(message.instance_update);
            console.log(message);
          }
        }
        if (message.hasOwnProperty("message_type")) {
          if (message.scriptName === this.scriptName) {
            let msg = message;
            switch (message.message_type) {
              case "trigger":
                this.parseTrigger(msg);
                break;
              case "hint":
                this.parseHint(msg);
                break;
              case "audio":
                this.parseAudio(msg);
                break;
              case "video":
                this.parseVideo(msg);
                break;
              default:
                break;
            }
          }
        }
      });
  }

  scriptUpdate(msg: any) {
    if (msg.hasOwnProperty("time")) {
      let t = msg.time;
      t.hours = t.hours.toString().padStart(2, "0");
      t.minutes = t.minutes.toString().padStart(2, "0");
      t.seconds = t.seconds.toString().padStart(2, "0");
      this.time = t;
    }
  }

  parseTrigger(msg) {
    let api = this.rootServer.branchApi;
    console.log(msg);

    if (msg.trigger.hint != "") {
      this.hintText = msg.trigger.hint;
    }

    if (msg.trigger.video != "") {
      let t = msg.trigger;
      this.parseVideoType(t.video_type, t.video, t.loop_video, t.pause_timer);
      // this.videoElem.nativeElement.src = `${api}/${msg.trigger.video}`;
      // this.videoElem.nativeElement.play();
    }

    if (msg.trigger.audio != "") {
      let path = `${api}/${msg.trigger.audio}`;
      // this.audioElem.nativeElement.src = `${api}/${msg.trigger.audio}`;
      switch (msg.trigger.audio_type) {
        case "start":
          // this.startAudio = new Audio(path);
          this.playStartAudio();
          break;
        case "end":
          // this.endAudio = new Audio(path);
          this.playEndAudio();
          break;
        case "hint":
          // this.hintAudio = new Audo(path);
          this.playHintAudio();
          break;
        case "background":
          // this.backgroundAudio = new Audio(path);
          this.playBackgroundAudio();
          break;
        case "custom":
          this.customAudio = new Audio(path);
          this.playCustomAudio();
          break;

        default:
          break;
      }
      // this.audioElem.nativeElement.play();
    }
  }

  parseHint(msg) {
    if (msg.hintText == undefined) {
      return;
    }
    if (msg.hintText == "--clear--") {
      this.hintText = "";
    } else {
      let initSize = 8;
      let hintSize = msg.hintText.length;
      let scale = hintSize * 0.035;

      scale = initSize - scale;
      if (scale < 3) scale = 3;
      this.hintTextSize["font-size"] = `${scale}vw`;
      console.log(this.hintTextSize);
      this.hintText = msg.hintText;
      this.playHintAudio();
    }
  }
  parseVideo(msg) {}

  // =============================================================
  // =============================================================
  // ==================== AUDIO ==================================
  // =============================================================
  // =============================================================
  parseAudio(msg) {
    let api = this.rootServer.branchApi;
    let path = `${api}/${msg.audioFile}`;
    this.customAudio = new Audio(path);
    this.playCustomAudio();
  }

  stopAllAudio() {
    for (let i = 0; i < this.audioArray.length; i++) {
      const audio = this.audioArray[i];
      audio.pause();
    }
  }

  playStartAudio() {
    this.startAudio.play();
    this.lowerBackgroundVolume();
    this.startAudio.onended = () => {
      this.raiseBackgroundVolume();
    };
  }

  playEndAudio() {
    this.endAudio.play();
    this.lowerBackgroundVolume();
    this.endAudio.onended = () => {
      this.raiseBackgroundVolume();
    };
  }

  playHintAudio() {
    this.hintAudio.play();
    this.lowerBackgroundVolume();
    this.hintAudio.onended = () => {
      this.raiseBackgroundVolume();
    };
  }

  playBackgroundAudio() {
    this.backgroundAudio.play();
  }

  playCustomAudio() {
    this.customAudio.play();
    this.lowerBackgroundVolume();
    this.customAudio.onended = () => {
      this.raiseBackgroundVolume();
    };
  }

  lowerBackgroundVolume() {
    this.backgroundAudio.volume = 0.3;
  }

  raiseBackgroundVolume() {
    this.backgroundAudio.volume = 1.0;
  }

  // =============================================================
  // =============================================================
  // ==================== VIDEO ==================================
  // =============================================================
  // =============================================================

  parseVideoType(type, path, loop, pauseTimer) {
    switch (type) {
      case "background":
        this.playBackgroundVideo(path, loop, pauseTimer);
        break;
      default:
        this.playCustomVideo(path, loop, pauseTimer);
        break;
    }
  }

  playBackgroundVideo(path, loop, pauseTimer) {
    path = `${this.branchApi}/${path}`;
    this.videoElem.nativeElement.src = path;
    this.videoElem.nativeElement.play();
    this.videoElem.nativeElement.loop = loop;
  }
  playCustomVideo(path, loop, pauseTimer) {
    path = `${this.branchApi}/${path}`;
    this.enableVideoOverride(true);
    this.videoElemOverride.nativeElement.src = path;
    this.videoElemOverride.nativeElement.play();
    this.videoElemOverride.nativeElement.loop = loop;
    if (pauseTimer) {
      this.rootServer.pauseInstanceTimer(this.scriptName).subscribe(result => {
        console.log(result);
      });
    }
    this.videoElemOverride.nativeElement.onended = () => {
      this.enableVideoOverride(false);
      if (pauseTimer) {
        this.rootServer
          .resumeInstanceTimer(this.scriptName)
          .subscribe(result => {
            console.log(result);
          });
      }
    };
    //if timer pauses
    //if loop? nah..
    // event .ended - resume
  }
}
