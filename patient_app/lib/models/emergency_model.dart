/// Ambulance details, filled in by the hospital once it reaches
/// AMBULANCE_ASSIGNED. Before that the backend sends empty strings.
class EmergencyAmbulance {
  final String vehicleNumber;
  final String driverName;
  final String driverPhone;

  EmergencyAmbulance({
    required this.vehicleNumber,
    required this.driverName,
    required this.driverPhone,
  });

  bool get isAssigned =>
      vehicleNumber.isNotEmpty || driverName.isNotEmpty || driverPhone.isNotEmpty;

  factory EmergencyAmbulance.fromJson(Map<String, dynamic> json) {
    return EmergencyAmbulance(
      vehicleNumber: json["vehicleNumber"] ?? "",
      driverName: json["driverName"] ?? "",
      driverPhone: json["driverPhone"] ?? "",
    );
  }
}

class EmergencyModel {
  /// How far a patient may call their own request off. Mirrors
  /// CANCELLABLE_EMERGENCY_STATUSES in the backend controller - past ARRIVED
  /// the crew is on scene and the server refuses with a 409.
  static const List<String> cancellableStatuses = [
    "REQUESTED",
    "ACKNOWLEDGED",
    "AMBULANCE_ASSIGNED",
    "ON_THE_WAY",
  ];

  /// Lifecycle order enforced by the backend. CANCELLED is deliberately absent:
  /// it is a terminal branch off this flow, not a step along it.
  static const List<String> statusFlow = [
    "REQUESTED",
    "ACKNOWLEDGED",
    "AMBULANCE_ASSIGNED",
    "ON_THE_WAY",
    "ARRIVED",
    "PATIENT_PICKED",
    "COMPLETED",
  ];

  final String id;
  final String status;
  final String reason;
  final String message;
  final DateTime? createdAt;
  final DateTime? cancelledAt;
  final EmergencyAmbulance ambulance;

  // Hospital comes back populated from POST 201 and GET /my/active, but the
  // 409 "already active" branch returns the raw document, where `hospital` is
  // just an id string. Only the id is guaranteed.
  final String hospitalId;
  final String? hospitalName;
  final String? hospitalPhone;
  final String? hospitalCity;
  final String? hospitalState;

  EmergencyModel({
    required this.id,
    required this.status,
    required this.reason,
    required this.message,
    required this.createdAt,
    required this.cancelledAt,
    required this.ambulance,
    required this.hospitalId,
    this.hospitalName,
    this.hospitalPhone,
    this.hospitalCity,
    this.hospitalState,
  });

  /// How many steps of [statusFlow] are done. -1 if the backend ever sends a
  /// status this build does not know about.
  int get stepIndex => statusFlow.indexOf(status);

  bool get isCompleted => status == "COMPLETED";

  bool get isCancelled => status == "CANCELLED";

  /// Terminal either way - nothing further will happen to this request.
  bool get isClosed => isCompleted || isCancelled;

  bool get canCancel => cancellableStatuses.contains(status);

  bool get hasAmbulance => ambulance.isAssigned;

  factory EmergencyModel.fromJson(Map<String, dynamic> json) {
    final hospital = json["hospital"];
    final isPopulated = hospital is Map<String, dynamic>;

    return EmergencyModel(
      id: json["_id"] ?? "",
      status: json["status"] ?? "REQUESTED",
      reason: json["reason"] ?? "OTHER",
      message: json["message"] ?? "",
      createdAt: json["createdAt"] != null
          ? DateTime.tryParse(json["createdAt"])
          : null,
      cancelledAt: json["cancelledAt"] != null
          ? DateTime.tryParse(json["cancelledAt"])
          : null,
      ambulance: EmergencyAmbulance.fromJson(
        json["ambulance"] is Map<String, dynamic>
            ? json["ambulance"]
            : const <String, dynamic>{},
      ),
      hospitalId: isPopulated ? (hospital["_id"] ?? "") : (hospital ?? "").toString(),
      hospitalName: isPopulated ? hospital["name"] : null,
      hospitalPhone: isPopulated ? hospital["phone_number"] : null,
      hospitalCity: isPopulated ? hospital["city"] : null,
      hospitalState: isPopulated ? hospital["state"] : null,
    );
  }
}

/// The six values `EmergencyModel.reason` accepts server-side. The controller
/// does not validate this field, so an unknown value surfaces as a 500 rather
/// than a 400 - only ever send one of these.
class EmergencyReason {
  static const Map<String, String> labels = {
    "CHEST_PAIN": "Chest pain",
    "BREATHING_DIFFICULTY": "Difficulty breathing",
    "ACCIDENT": "Accident / injury",
    "UNCONSCIOUS": "Unconscious",
    "SEVERE_PAIN": "Severe pain",
    "OTHER": "Other",
  };

  static String label(String value) => labels[value] ?? value;
}
