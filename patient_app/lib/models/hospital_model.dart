class Hospital {
  final String id;
  final String name;
  final String city;
  final String state;
  final double? distanceKm;

  Hospital({
    required this.id,
    required this.name,
    required this.city,
    required this.state,
    this.distanceKm,
  });

  factory Hospital.fromJson(Map<String, dynamic> json) {
    return Hospital(
      id: json['_id'],
      name: json['name'],
      city: json['city'],
      state: json['state'],
      distanceKm: json['distanceKm'] != null ? (json['distanceKm'] as num).toDouble() : null,
    );
  }
}
