class DoctorModel {
  final String id;
  final String name;
  final String email;
  final int experience;
  final String position;
  final List<String> specialisations;
  final String profilePhoto;
  final String hospitalName;
  final List<OpdScheduleModel> opdSchedule;
  final String departmentName; // agar department populate karoge

  DoctorModel({
    required this.id,
    required this.name,
    required this.email,
    required this.experience,
    required this.specialisations,    
    required this.hospitalName,
    required this.departmentName,
    required this.position,
    required this.opdSchedule,
    required this.profilePhoto, 
  });

  factory DoctorModel.fromJson(Map<String, dynamic> json) {
    return DoctorModel(
      id: json['_id'] ?? '',
      position: json['position'] ?? '',
      name: json['userId']?['name'] ?? '',
      email: json['userId']?['email'] ?? '',
      experience: json['experience'] ?? 0,
      specialisations:
        (json['specialisations'] as List<dynamic>?)
            ?.map((e) => e.toString())
            .toList() ??
        [], 
      opdSchedule:
        (json['opdSchedule'] as List<dynamic>?)
            ?.map((e) => OpdScheduleModel.fromJson(e))
            .toList() ??
        [],     
      hospitalName: json['hospital']?['name'] ?? '',
      departmentName: json['department'] is Map
            ? json['department']['name'] ?? ''
            : (json['department'] ?? '').toString(), 
      profilePhoto: json['profile_photo']??'',
    );
  }
}

class OpdScheduleModel {
  final String day;
  final String from;
  final String to;
  final bool isAvailable;

  OpdScheduleModel({
    required this.day,
    required this.from,
    required this.to,
    required this.isAvailable,
  });

  factory OpdScheduleModel.fromJson(Map<String, dynamic> json) {
    return OpdScheduleModel(
      day: json['day'] ?? '',
      from: json['from'] ?? '',
      to: json['to'] ?? '',
      isAvailable: json['isAvailable'] ?? false,
    );
  }
}