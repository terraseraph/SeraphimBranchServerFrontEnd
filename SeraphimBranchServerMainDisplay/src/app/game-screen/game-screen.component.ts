import { Component, OnInit, ViewChild } from "@angular/core";
import { RouterModule, Routes, ActivatedRoute, Router } from "@angular/router";
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
  screenName: any;
  screenConfig: any;

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
  customFontStyle: any;
  hintTextSize: any;
  showTimer: boolean;
  showHints: boolean;
  defaultBackgroundIsVideo: boolean;

  videoOverrideStyle: any;

  @ViewChild("videoElem") videoElem: any;
  @ViewChild("imageElem") imageElem: any;
  @ViewChild("videoElemOverride") videoElemOverride: any;
  @ViewChild("hintElem") hintElem: any;
  @ViewChild("audioElem") audioElem: any;

  ngOnInit() {
    this.branchApi = this.rootServer.branchApi;
    this.rootApi = this.rootServer.api;
    this.route.paramMap.subscribe(params => {
      this.scriptName = params.get("name");
      this.screenName = params.get("screenName");
      console.log(this.scriptName);
      console.log(this.screenName);
      this.getScript(this.scriptName);
      // this.getScreenConfig();
    });
    this.socketSubscribe();
  }

  // getScreenConfig() {
  //   let configs = this.configService.screenConfig.configs;
  //   for (var i = 0; i < configs.length; i++) {
  //     if (configs[i].name === this.scriptName) {
  //       this.customStyles = configs[i].style;
  //     }
  //   }
  //   this.hintTextSize = {
  //     "font-size": "6vw"
  //   };
  // }

  getScript(scriptName: any) {
    this.rootServer.loadScript(scriptName).subscribe(script => {
      this.script = script;
      this.getScreenConfig();
    });
  }
  getScreenConfig() {
    let configs = this.script.screenConfigs;
    for (var i = 0; i < configs.length; i++) {
      if (configs[i].name === this.screenName) {
        //     this.screenConfig = configs[i];
        //     console.log(this.screenConfig);

        //     // Show the timer
        //     this.showTimer = configs[i].showTimer;

        //     // Show hints
        //     this.showHints = configs[i].showHints;

        //     //Custom screen font
        //     this.customFontStyle = {
        //       "font-family": configs[i].font,
        //       color: configs[i].font_colour
        //     };

        //     // Set default background type
        //     if (configs[i].backgroundType === "Video") {
        //       this.initVideo(configs[i].backgroundPath);
        //       this.defaultBackgroundIsVideo = true;
        //     } else {
        //       this.defaultBackgroundIsVideo = false;
        // }
        //     this.initAudio();
        this.setConfigs(configs[i]);
      }
    }

    this.hintTextSize = {
      "font-size": "6vw"
    };
  }

  setConfigs(configs) {
    this.screenConfig = configs;
    console.log(this.screenConfig);

    // Show the timer
    this.showTimer = configs.showTimer;

    // Show hints
    this.showHints = configs.showHints;

    //Custom screen font
    this.customFontStyle = {
      "font-family": configs.font,
      color: configs.font_colour
    };

    // Set default background type
    if (configs.backgroundType === "Video") {
      this.initVideo(configs.backgroundPath);
      this.defaultBackgroundIsVideo = true;
    } else {
      this.defaultBackgroundIsVideo = false;
    }
    this.initAudio();
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
    // path = `${api}/${path}`;
    path = `${path}`;
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

  initVideo(videoPath) {
    //For background video
    this.videoElem.nativeElement.setAttribute("width", "100%");
    this.videoElem.nativeElement.setAttribute("height", "100%");
    this.videoElem.nativeElement.setAttribute("type", "video/mp4");

    //For Playing videos over the top
    this.videoElemOverride.nativeElement.setAttribute("width", "100%");
    this.videoElemOverride.nativeElement.setAttribute("height", "100%");
    this.videoElemOverride.nativeElement.setAttribute("type", "video/mp4");
    this.enableVideoOverride(false);
    this.playBackgroundVideo(videoPath, true, false);
  }
  // initVideo() {
  //   //For background video
  //   this.videoElem.nativeElement.setAttribute("width", "100%");
  //   this.videoElem.nativeElement.setAttribute("height", "100%");
  //   this.videoElem.nativeElement.setAttribute("type", "video/mp4");

  //   //For Playing videos over the top
  //   this.videoElemOverride.nativeElement.setAttribute("width", "100%");
  //   this.videoElemOverride.nativeElement.setAttribute("height", "100%");
  //   this.videoElemOverride.nativeElement.setAttribute("type", "video/mp4");
  //   this.enableVideoOverride(false);
  //   for (let trigger of this.script.triggers) {
  //     if (trigger.video != "") {
  //       if (trigger.video_type == "background") {
  //         this.playBackgroundVideo(
  //           trigger.video,
  //           trigger.loop_video,
  //           trigger.pause_timer
  //         );
  //       }
  //     }
  //   }
  // }

  initImage(imagePath) {
    this.imageElem.nativeElement.setAttribute("width", "100%");
    this.imageElem.nativeElement.setAttribute("height", "100%");
    this.imageElem.nativeElement.setAttribute("src", `${imagePath}`);
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
        if (message.hasOwnProperty("reload")) {
          if (
            message.scriptName === this.scriptName &&
            message.screenName === this.screenName
          ) {
            window.location.reload();
          }
        }
        if (message.hasOwnProperty("message_type")) {
          if (
            message.scriptName === this.scriptName &&
            message.screenName === this.screenName
          ) {
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
              case "config":
                this.setConfigs(msg.config);
              default:
                break;
            }
          } else if (message.message_type === "hint") {
            this.parseHint(message);
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
      // let path = `${api}/${msg.trigger.audio}`;
      let path = `${msg.trigger.audio}`;
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
  parseVideo(msg) {
    let api = this.rootServer.branchApi;
    // let path = `${api}/${msg.videoFile}`;
    let path = `${msg.videoFile}`;
    this.playCustomVideo(msg.videoFile, false, false);
  }

  // =============================================================
  // =============================================================
  // ==================== AUDIO ==================================
  // =============================================================
  // =============================================================
  parseAudio(msg) {
    let api = this.rootServer.branchApi;
    // let path = `${api}/${msg.audioFile}`;
    let path = `${msg.audioFile}`;
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
    // path = `${this.branchApi}/${path}`;
    path = `${path}`;
    this.videoElem.nativeElement.src = path;
    this.videoElem.nativeElement.play();
    this.videoElem.nativeElement.loop = loop;
  }
  playCustomVideo(path, loop, pauseTimer) {
    // path = `${this.branchApi}/${path}`;
    path = `${path}`;
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
