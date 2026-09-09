/// A pharmacy as returned by `GET /api/pharmacy/nearby`.
///
/// `distanceKm` is only present on the nearby search - the aggregation adds it
/// from `$geoNear`. Coordinates come back as GeoJSON `[lng, lat]`.
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
  final double? distanceKm;
  final bool isActive;

  Pharmacy({
    required this.id,
    required this.shopName,
    required this.ownerName,
    required this.phone,
    required this.address,
    required this.city,
    required this.state,
    required this.pincode,
    required this.isActive,
    this.latitude,
    this.longitude,
    this.distanceKm,
  });

  factory Pharmacy.fromJson(Map<String, dynamic> json) {
    // GeoJSON stores [lng, lat], not [lat, lng].
    final coordinates = json["location"] is Map
        ? (json["location"]["coordinates"] as List?)
        : null;

    return Pharmacy(
      id: json["_id"] ?? "",
      shopName: json["shopName"] ?? "",
      ownerName: json["ownerName"] ?? "",
      phone: json["phone"] ?? "",
      address: json["address"] ?? "",
      city: json["city"] ?? "",
      state: json["state"] ?? "",
      pincode: json["pincode"]?.toString() ?? "",
      isActive: json["isActive"] ?? false,
      longitude: coordinates != null && coordinates.length > 1
          ? (coordinates[0] as num).toDouble()
          : null,
      latitude: coordinates != null && coordinates.length > 1
          ? (coordinates[1] as num).toDouble()
          : null,
      distanceKm: json["distanceKm"] != null
          ? (json["distanceKm"] as num).toDouble()
          : null,
    );
  }

  String get shortAddress {
    final parts = [address, city, state].where((p) => p.isNotEmpty).toList();
    return parts.join(", ");
  }
}
