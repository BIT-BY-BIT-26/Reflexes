class AppointmentModel {
  final String id;
  final String doctorName;
  final String doctorId;
  final String hospitalName;
  final String departmentName;
  final String appointmentType; // 👈 final karo (better practice)

  String status;
  int? token;

  AppointmentModel({
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
      doctorId: json['doctorId'] ?? '',
      hospitalName: json['hospital'] ?? 'Unknown Hospital',
      departmentName: json['department'] ?? 'Unknown Department',
      appointmentType: json['appointmentType'] ?? 'offline', // 👈 VERY IMPORTANT
      status: json['status'] ?? 'PENDING',
      token: json['token'], 
    );
  }
}
