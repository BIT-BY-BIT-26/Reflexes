import 'package:patient_app/models/patient_address_model.dart';
import 'package:patient_app/models/user_model.dart';

class PatientModel {
  final String id;
  final DateTime? dob;
  final String? gender;
  final String? bloodGroup;
  final String? phone;
  final String? profileImage;
  final PatientAddress? address;
  final UserModel user;

  PatientModel({
    required this.id,
    this.dob,
    this.gender,
    this.bloodGroup,
    this.phone,
    this.profileImage,
    this.address,
    required this.user,
  });

  factory PatientModel.fromJson(Map<String, dynamic> json) {
    return PatientModel(
      id: json['_id'].toString(),
      dob: json['dob'] != null
          ? DateTime.parse(json['dob'])
          : null,
      gender: json['gender'],
      bloodGroup: json['bloodGroup'],
      phone: json['phone_number']?.toString(),
      profileImage: json['profileImage'],
      address: json['address'] != null ? PatientAddress.fromJson(json['address']) : null,
      user: UserModel(
        id: json['userId']['_id'].toString(),
        name: json['userId']['name'],
        email: json['userId']['email'],
        role: "PATIENT",
      ),
    );
  }
}