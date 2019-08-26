export class SignUpInfo {
    name: string;
    address: string;
    email: string;
    role: string[];
    password: string;

    constructor(name: string, address: string, email: string, password: string) {
        this.name = name;
        this.address = address;
        this.email = email;
        this.password = password;
        this.role = ['user'];
    }
}
