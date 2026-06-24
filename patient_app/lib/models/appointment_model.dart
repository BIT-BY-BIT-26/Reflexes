class AppointmentModel {
  final String id;
  final String doctorName;
  final String doctorId;
  final String doctorProfilePhoto;
  final String hospitalName;
  final String departmentName;
  final DateTime date;
  final String appointmentType; // 👈 final karo (better practice)

  String status;
  int? token;

  AppointmentModel({
    required this.date,
    required this.doctorProfilePhoto,
    required this.id,
    required this.doctorName,
    required this.doctorId,
    required this.hospitalName,
    required this.departmentName,
    required this.appointmentType, // 👈 add karo
    required this.status,
    this.token,
  });

  factory AppointmentModel.fromJson(Map<String, dynamic> json) {
    return AppointmentModel(
      id: json['id'] ?? '',
      doctorName: json['doctorName'] ?? 'Unknown Doctor',
      doctorProfilePhoto: json['doctorProfilePhoto']??'',
      doctorId: json['doctorId'] ?? '',
      hospitalName: json['hospital'] ?? 'Unknown Hospital',
      departmentName: json['department'] ?? 'Unknown Department',
      appointmentType:
          json['appointmentType'] ?? 'offline', // 👈 VERY IMPORTANT
      status: json['status'] ?? 'PENDING',
      date: DateTime.parse(json['date']),
      token: json['token'],
    );
  }
}
