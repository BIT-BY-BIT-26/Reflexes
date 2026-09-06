class Pharmacy {
  final String id;
  final String shopName;
  final String ownerName;
  final String phone;
  final String address;
  final String city;
  final String state;
  final String pincode;

  final double? latitude;
  final double? longitude;

  Pharmacy({
    required this.id,
    required this.shopName,
    required this.ownerName,
    required this.phone,
    required this.address,
    required this.city,
    required this.state,
    required this.pincode,
    this.latitude,
    this.longitude,
  });

  factory Pharmacy.fromJson(
    Map<String, dynamic> json,
  ) {
    final location = json['location'];

    double? latitude;
    double? longitude;

    if (location != null &&
        location['coordinates'] != null &&
        location['coordinates'].length >= 2) {
      longitude =
          (location['coordinates'][0] as num).toDouble();

      latitude =
          (location['coordinates'][1] as num).toDouble();
    }

    return Pharmacy(
      id: json['_id']?.toString() ?? '',
      shopName: json['shopName'] ?? '',
      ownerName: json['ownerName'] ?? '',
      phone: json['phone'] ?? '',
      address: json['address'] ?? '',
      city: json['city'] ?? '',
      state: json['state'] ?? '',
      pincode: json['pincode'] ?? '',
      latitude: latitude,
      longitude: longitude,
    );
  }
}