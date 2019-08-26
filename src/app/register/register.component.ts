import { Component, OnInit } from '@angular/core';

import { AuthService } from '../auth/auth.service';
import { SignUpInfo } from '../auth/signup-info';
import { User } from '../model/user';
import { RolesEnum } from '../model/RolesEnum';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  form: any = {};
  signupInfo: User;
  isSignedUp = false;
  isSignUpFailed = false;
  errorMessage = '';

  formGroup: FormGroup;
  


  constructor(private authService: AuthService) { }

  ngOnInit() { 
    this.formGroup = new FormGroup({
      'username': new FormControl(this.form.username, [Validators.required,
        Validators.minLength(4)]),

    })
   
    this.form.email = "";
    this.form.username = "";
    this.form.password = "";
  }

  onSubmit() {

    this.signupInfo = {
      idUser: 0,
      role: RolesEnum.player, 
      username: this.form.username,
      email: this.form.email,
      password: this.form.password
    }

    this.authService.signUp(this.signupInfo).subscribe(
      data => {
        console.log(data);
        this.isSignedUp = true;
        this.isSignUpFailed = false;
      },
      error => {
        console.log(error);
        this.errorMessage = error.error.message;
        this.isSignUpFailed = true;
      }
    );
  }
}
