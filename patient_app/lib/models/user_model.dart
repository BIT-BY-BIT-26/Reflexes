class UserModel {
  final String id;
  final String name;
  final String email;
  final String role;
  final String? token;
  final String? patientId;  
  
  UserModel( {
    required this.id,
    required this.name,
    required this.email,
    required this.role,
    this.token,
    this.patientId,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['user']['id'],
      name: json['user']['name'],
      email: json['user']['email'],
      role: json['role'],
      patientId: json['user']['patientId'],
      token: json['token'],
    );
  }
}
