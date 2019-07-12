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

  rootApi: any;

  // Script vars
  scriptName: any;
  screenName: any;
  screenConfig: any;

  script: any;
  socketSubscription: Subscription;
  time: any;
  colon: any;
  gameEnded: boolean;
  states: any;

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
  hintTextOld: any;
  hintHasAudio: boolean;
  hintDefaultAudioPath: any;

  // Custom Configs
  customFontStyle: any;
  hintTextSize: any;
  showTimer: boolean;
  showHints: boolean;
  defaultBackgroundIsVideo: boolean;

  videoOverrideStyle: any;

  DefaultStates = {
    START: "start_instance",
    END: "end_instance",
    TIMER_COMPLETE: "timer_complete "
  };

  @ViewChild("videoElem") videoElem: any;
  @ViewChild("imageElem") imageElem: any;
  @ViewChild("videoElemOverride") videoElemOverride: any;
  @ViewChild("hintElem") hintElem: any;
  @ViewChild("audioElem") audioElem: any;

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.scriptName = params.get("name");
      this.screenName = params.get("screenName");
      console.log(this.scriptName);
      console.log(this.screenName);
      this.getScript(this.scriptName);
      // this.getScreenConfig();
    });
    this.socketSubscribe();
    this.initAudio();
    this.colon = " ";
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
    if (configs.defaultHintAudioPath != "") {
      this.hintHasAudio = true;
      this.hintDefaultAudioPath = configs.defaultHintAudioPath;
    } else {
      this.hintHasAudio = false;
    }
  }

  initAudio() {
    this.startAudio = new Audio();
    this.endAudio = new Audio();
    this.hintAudio = new Audio();
    this.backgroundAudio = new Audio();
    this.customAudio = new Audio();

    this.audioArray = new Array();
    this.audioArray.push(this.startAudio);
    this.audioArray.push(this.endAudio);
    this.audioArray.push(this.hintAudio);
    this.audioArray.push(this.backgroundAudio);
    this.audioArray.push(this.customAudio);
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
          }
        }
        if (message.hasOwnProperty("reload")) {
          if (
            message.scriptName === this.scriptName &&
            message.screenName === this.screenName
          ) {
            window.location.reload();
          } else if (message.all === true) {
            window.location.reload();
          }
        }
        if (message.hasOwnProperty("message_type")) {
          console.log(message);
          if (this.validateMessage(message)) {
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
          }
        }
      });
  }

  validateMessage(msg) {
    if (msg.scriptName === this.scriptName) {
      if (msg.screenName === this.screenName) {
        return true;
      } else if (msg.screenName === "all" || msg.screenName === undefined) {
        return true;
      } else if (msg.screenName !== this.screenName) {
        return false;
      }
    }
  }

  scriptUpdate(msg: any) {
    if (msg.hasOwnProperty("states")) {
      console.log("GETTING STATES", msg.states);
      this.states = msg.states;
      this.isStateActive("end_instance").then(active => {
        if (active) {
          this.gameEnded = true;
        } else {
          this.gameEnded = false;
        }
      });
    }
    if (msg.hasOwnProperty("time")) {
      let t = msg.time;
      this.colon = ":";
      t.hours = t.hours.toString().padStart(2, "0");
      t.minutes = t.minutes.toString().padStart(2, "0");
      t.seconds = t.seconds.toString().padStart(2, "0");
      this.time = t;
      let hnt = msg.displayedHint;
      var ht = {
        hintText: hnt
      };
      this.parseHint(ht);
    }
  }

  parseTrigger(msg) {
    // let api = this.rootServer.branchApi;
    console.log(msg);

    if (msg.trigger.hint != "") {
      console.log("IS HINT");
      this.hintText = msg.trigger.hint;
    }

    //Check if the end_instance or start instance has occured
    this.setDefaultStates(msg.trigger.trigger);

    if (msg.trigger.video != "") {
      console.log("IS VIDEO");
      let t = msg.trigger;
      this.parseVideoType(t.video_type, t.video, t.loop_video, t.pause_timer);
    }

    if (msg.trigger.audio != "") {
      console.log("IS AUDIO");
      console.log(msg.trigger.audio_type);

      let pause = msg.trigger.pause_timer;
      let loop = msg.trigger.loop_audio;
      if (pause == undefined) {
        pause = false;
      }
      if (loop == undefined) {
        loop = false;
      }

      let path = `${msg.trigger.audio}`;
      switch (msg.trigger.audio_type) {
        case "start":
          this.startAudio.src = path;
          this.playStartAudio(pause, loop);
          break;
        case "end":
          this.endAudio.src = path;
          this.playEndAudio(pause, loop);
          break;
        case "hint":
          this.hintAudio.src = path;
          this.playHintAudio(pause, loop);
          break;
        case "background":
          this.backgroundAudio.src = path;
          this.playBackgroundAudio(pause, loop);
          break;
        case "custom":
          this.customAudio.src = path;
          this.playCustomAudio(pause, loop);
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
      // console.log(this.hintTextSize);
      this.hintText = msg.hintText;
      if (this.hintText !== this.hintTextOld && this.hintText !== "") {
        this.playHintAudio(false, false);
        this.hintTextOld = this.hintText;
      }
    }
  }
  parseVideo(msg) {
    // let api = this.rootServer.branchApi;
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
    let path = `${msg.audioFile}`;
    this.customAudio.src = path;
    this.playCustomAudio(false, false);
  }

  stopAllAudio() {
    for (let i = 0; i < this.audioArray.length; i++) {
      const audio = this.audioArray[i];
      audio.pause();
    }
  }

  playStartAudio(pauseTimer, loop) {
    this.startAudio.loop = loop;
    this.startAudio.play();
    this.lowerBackgroundVolume();
    console.log("START AUDIO LOWER");
    if (pauseTimer) {
      this.rootServer.pauseInstanceTimer(this.scriptName).subscribe(result => {
        console.log(result);
      });
    }
    this.startAudio.onended = () => {
      this.raiseBackgroundVolume();
      if (pauseTimer) {
        if (!this.gameEnded) {
          console.log("HAS NOT ENDED!!!!");
          this.rootServer
            .resumeInstanceTimer(this.scriptName)
            .subscribe(result => {
              console.log(result);
            });
        }
      }
    };
  }

  playEndAudio(pause, loop) {
    this.endAudio.play();
    this.endAudio.loop = loop;
    console.log("END AUDIO LOWER");
    this.lowerBackgroundVolume();
    this.endAudio.onended = () => {
      this.raiseBackgroundVolume();
    };
  }

  playHintAudio(pause, loop) {
    if (this.hintHasAudio) {
      this.hintAudio.src = this.hintDefaultAudioPath;
      this.hintAudio.play();
      console.log("HINT AUDIO LOWER");
      this.lowerBackgroundVolume();
      this.hintAudio.onended = () => {
        this.raiseBackgroundVolume();
      };
    }
  }

  playBackgroundAudio(pause, loop) {
    this.backgroundAudio.loop = loop;
    this.backgroundAudio.play();
  }

  stopBackgroundAudio() {
    this.backgroundAudio.pause();
  }

  stopBackgroundLooping() {
    this.backgroundAudio.loop = false;
  }

  playCustomAudio(pauseTimer, loop) {
    this.customAudio.play();
    console.log("CUSTOM AUDIO LOWER");
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
    this.lowerBackgroundVolume();
    this.videoElemOverride.nativeElement.loop = loop;
    if (pauseTimer) {
      this.rootServer.pauseInstanceTimer(this.scriptName).subscribe(result => {
        console.log(result);
      });
    }
    this.videoElemOverride.nativeElement.onended = () => {
      this.enableVideoOverride(false);
      this.raiseBackgroundVolume();
      if (pauseTimer) {
        if (!this.gameEnded) {
          console.log("HAS NOT ENDED!!!!");
          this.rootServer
            .resumeInstanceTimer(this.scriptName)
            .subscribe(result => {
              console.log(result);
            });
        }
      }
    };
    //if timer pauses
    //if loop? nah..
    // event .ended - resume
  }
  isStateActive(name: any) {
    return new Promise((resolve, reject) => {
      let result: boolean = false;
      for (var i = 0; i < this.states.length; i++) {
        if (this.states[i].name == name) {
          result = this.states[i].active;
          resolve(result);
        }
      }
    });
  }

  setDefaultStates(triggerState) {
    switch (triggerState) {
      case this.DefaultStates.START:
        this.colon = " ";
        this.time = null;
        this.gameEnded = false;
        break;
      case this.DefaultStates.END:
        this.gameEnded = true;
        this.stopBackgroundAudio();
        break;
      case this.DefaultStates.TIMER_COMPLETE:
        this.stopBackgroundLooping();
      default:
        break;
    }
  }
}
