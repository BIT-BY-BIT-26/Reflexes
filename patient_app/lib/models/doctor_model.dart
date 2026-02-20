class DoctorModel {
  final String id;
  final String name;
  final String email;
  final int experience;
  final String position;
  final String specialisation;
  final String hospitalName;
  final String departmentName; // agar department populate karoge

  DoctorModel( {
    required this.id,
    required this.name,
    required this.email,
    required this.experience,
    required this.specialisation,
    required this.hospitalName,
    required this.departmentName, 
    required this.position,
  });

  factory DoctorModel.fromJson(Map<String, dynamic> json) {
    return DoctorModel(
      id: json['_id'] ?? '',
      position: json['position'] ?? '',
      name: json['userId']?['name'] ?? '',
      email: json['userId']?['email'] ?? '',
      experience: json['experience'] ?? 0,
      specialisation: json['specialisation'] ?? '',
      hospitalName: json['hospital']?['name'] ?? '',
      departmentName: json['department'] is Map
          ? json['department']['name'] ?? ''
          : (json['department'] ?? '').toString(),
    );
  }
}
