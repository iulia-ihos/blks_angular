import { Component, OnInit } from '@angular/core';

import { AuthService } from '../auth/auth.service';
import { User } from '../model/user';
import { RolesEnum } from '../model/RolesEnum';
import { FormControl, FormGroup, Validators, ValidatorFn, AbstractControl } from '@angular/forms';

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

      'email': new FormControl(this.form.email, [Validators.required]),

      'password': new FormControl(this.form.password, [Validators.required,
        Validators.minLength(8), this.emailValidator(this.emailRegex)])

    })

   
    this.form.email = "";
    this.form.username = "";
    this.form.password = "";
  }

  private emailRegex = new RegExp("[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?");

  //returns null if validator checks
  emailValidator(email: RegExp): ValidatorFn {
    return (control: AbstractControl): {[key: string]: any} | null => {
      const valid = email.test(control.value);
      return valid ? null: {'email': {value: control.value}};
    };
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

  goToLoginPage() {
    window.location.assign("login");
  }
}
