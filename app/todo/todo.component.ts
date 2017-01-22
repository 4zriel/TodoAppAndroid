import { Todo } from './../models/todo';
import { FirebaseService } from './../services/firebase.service';
import { CommonService } from './../services/common.service';
import { Component, OnInit, NgZone } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Router, ActivatedRoute } from '@angular/router';
import * as enums from 'ui/enums';
import * as imageSource from 'image-source';
import { isAndroid } from "platform";
import { View } from "ui/core/view";

import * as camera from "nativescript-camera";
import * as fs from "file-system";

var imageModule = require("ui/image");
var img;

@Component({
  moduleId: module.id,
  selector: "todo",
  templateUrl: "todo.html"
})

export class TodoComponent implements OnInit {
  private isLoading: boolean = true;
  id: string;
  image: any;
  private sub: any;
  public date: Date;
  private imagePath: string;
  private uploadedImageName: string;
  private uploadedImagePath: string;
  public todo: Observable<any>;
  private innerTodo: Todo = new Todo();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ngZone: NgZone,
    private firebaseService: FirebaseService,
    private commonService: CommonService
  ) { }

  ngOnInit() {
    camera.requestPermissions();
    this.sub = this.route.params.subscribe((params: any) => {
      this.id = params['id'];
      this.isLoading = false;
      this.innerTodo = this.firebaseService.getMyTodo(this.id);
    });
  }

  takePhoto() {
    let options = {
      width: 300,
      height: 300,
      keepAspectRatio: true,
      saveToGallery: true
    };
    camera.takePicture(options)
      .then(imageAsset => {
        imageSource.fromAsset(imageAsset).then(res => {
          this.image = res;
          this.saveToFile(this.image);
        })
      }).catch(function (err) {
        console.log("Error -> " + err.message);
      });
  }

  saveToFile(res) {
    let imgsrc = res;
    this.imagePath = this.commonService.documentsPath(`photo-${Date.now()}.png`);
    imgsrc.saveToFile(this.imagePath, enums.ImageFormat.png);
  }


  editTodo(id: string) {
    this.innerTodo.date.setHours(this.date.getUTCHours(), this.date.getUTCMinutes());
    if (this.image) {
      this.firebaseService.uploadFile(this.imagePath).then((uploadedFile: any) => {
        this.uploadedImageName = uploadedFile.name;
        this.firebaseService.getDownloadUrl(this.uploadedImageName).then((downloadUrl: string) => {
          this.innerTodo.imagepath = downloadUrl;
          this.firebaseService.editTodo(this.innerTodo).then((result: any) => {
            alert(result)
          }, (error: any) => {
            alert(error);
          });
        })
      }, (error: any) => {
        alert('File upload error: ' + error);
      });
    }
    else {
      this.firebaseService.editTodo(this.innerTodo).then((result: any) => {
        alert(result)
      }, (error: any) => {
        alert(error);
      });
    }
  }

}