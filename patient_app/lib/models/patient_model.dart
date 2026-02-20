import 'package:patient_app/models/user_model.dart';

class PatientModel {
  final String id;
  final int? age;
  final String? gender;
  final String? bloodGroup;
  final String? phone;
  final UserModel user;

  PatientModel({
    required this.id,
    this.age,
    this.gender,
    this.bloodGroup,
    this.phone,
    required this.user,
  });

  factory PatientModel.fromJson(Map<String, dynamic> json) {
    return PatientModel(
      id: json['_id'],
      age: json['age'],
      gender: json['gender'],
      bloodGroup: json['bloodGroup'],
      phone: json['phone_number']?.toString(),
      user: UserModel(
        id: json['userId']['_id'],
        name: json['userId']['name'],
        email: json['userId']['email'],
        role: "PATIENT",
      ),
    );
  }
}
