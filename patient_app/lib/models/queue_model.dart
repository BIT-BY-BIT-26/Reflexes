class ActiveQueueModel {
  final bool hasActiveQueue;
  final String? appointmentId;
  final String? doctorId;
  final String? doctorName;
  final String? department;
  final int? currentToken;
  final int? yourToken;
  final int? patientsAhead;
  final bool? isPaused;
  final bool? isOpdClosed;
  final String notification;

  ActiveQueueModel( {
    required this.hasActiveQueue,
    this.appointmentId,
    this.doctorId,
    this.doctorName,
    this.notification= "Consultation has not started yet",
    this.department,
    this.currentToken,
    this.yourToken,
    this.patientsAhead,
    this.isPaused,
    this.isOpdClosed,
  });
  factory ActiveQueueModel.fromJson(Map<String, dynamic> json) {
    return ActiveQueueModel(
      hasActiveQueue: json["hasActiveQueue"] ?? false,
      appointmentId: json["appointmentId"]?.toString(),
      doctorId: json["doctorId"]?.toString(),
      doctorName: json["doctorName"],
      department: json["department"],
      currentToken: json["currentToken"],
      yourToken: json["yourToken"],
      patientsAhead: json["patientsAhead"],
      isPaused: json["isPaused"]??false,
      isOpdClosed: json["isOpdClosed"],
    );
  }
}
