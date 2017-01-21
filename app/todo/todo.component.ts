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
  name: string;
  description: string;
  imagepath: string;
  image: any;
  private sub: any;
  private imagePath: string;
  private uploadedImageName: string;
  private uploadedImagePath: string;
  public todo: Observable<any>;

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
      this.firebaseService.getMyTodo(this.id).subscribe((Todo) => {
        this.ngZone.run(() => {
          for (let prop in Todo) {
            //props
            if (prop === "id") {
              this.id = Todo[prop];
            }
            if (prop === "name") {
              this.name = Todo[prop];
            }
            if (prop === "description") {
              this.description = Todo[prop];
            }
            if (prop === "imagepath") {
              this.imagepath = Todo[prop];
            }
            this.isLoading = false;
          }
        });
      });
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
          //save the source image to a file, then send that file path to firebase
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
    if (this.image) {
      //upload the file, then save all
      this.firebaseService.uploadFile(this.imagePath).then((uploadedFile: any) => {
        this.uploadedImageName = uploadedFile.name;
        //get downloadURL and store it as a full path;
        this.firebaseService.getDownloadUrl(this.uploadedImageName).then((downloadUrl: string) => {
          this.firebaseService.editTodo(this.todo[0]).then((result: any) => {
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
      //just edit the description
      this.firebaseService.editDescription(id, this.description).then((result: any) => {
        alert(result)
      }, (error: any) => {
        alert(error);
      });
    }
  }

}