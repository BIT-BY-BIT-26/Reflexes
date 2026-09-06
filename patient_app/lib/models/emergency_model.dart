class EmergencyModel {
  final String id;
  final String hospital;
  final String reason;
  final String message;
  final List<double> coordinates;
  final String status;
  final AmbulanceModel? ambulance;
  final DateTime? createdAt;

  EmergencyModel({
    required this.id,
    required this.hospital,
    required this.reason,
    required this.message,
    required this.coordinates,
    required this.status,
    this.ambulance,
    this.createdAt,
  });

  factory EmergencyModel.fromJson(Map<String, dynamic> json) {
    return EmergencyModel(
      id: json['_id'] ?? '',
      hospital: json['hospital'] is Map
          ? json['hospital']['_id'] ?? ''
          : json['hospital'] ?? '',
      reason: json['reason'] ?? 'OTHER',
      message: json['message'] ?? '',
      coordinates: json['location']?['coordinates'] != null
          ? List<double>.from(
              (json['location']['coordinates'] as List)
                  .map((e) => (e as num).toDouble()),
            )
          : [],
      status: json['status'] ?? 'REQUESTED',
      ambulance: json['ambulance'] != null
          ? AmbulanceModel.fromJson(json['ambulance'])
          : null,
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt'])
          : null,
    );
  }

  double? get longitude {
    if (coordinates.length < 2) return null;
    return coordinates[0];
  }

  double? get latitude {
    if (coordinates.length < 2) return null;
    return coordinates[1];
  }
}


class AmbulanceModel {
  final String vehicleNumber;
  final String driverName;
  final String driverPhone;

  AmbulanceModel({
    required this.vehicleNumber,
    required this.driverName,
    required this.driverPhone,
  });

  factory AmbulanceModel.fromJson(Map<String, dynamic> json) {
    return AmbulanceModel(
      vehicleNumber: json['vehicleNumber'] ?? '',
      driverName: json['driverName'] ?? '',
      driverPhone: json['driverPhone'] ?? '',
    );
  }
}