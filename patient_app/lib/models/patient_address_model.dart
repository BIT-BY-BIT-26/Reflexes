class PatientAddress {
  final String? line;
  final String? city;
  final String? state;
  final String? pincode;
  final List<double>? coordinates;

  PatientAddress({
    this.line,
    this.city,
    this.state,
    this.pincode,
    this.coordinates,
  });

  factory PatientAddress.fromJson(Map<String, dynamic> json) {
    return PatientAddress(
      line: json['line'],
      city: json['city'],
      state: json['state'],
      pincode: json['pincode'],
      coordinates: json['location']?['coordinates'] != null
          ? List<double>.from(
              (json['location']['coordinates'] as List)
                  .map((e) => (e as num).toDouble()),
            )
          : null,
    );
  }
}