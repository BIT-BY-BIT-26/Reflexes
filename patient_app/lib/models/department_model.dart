class DepartmentModel {
  final String id;
  final String name;
  final int doctorCount;

  DepartmentModel({
    required this.id,
    required this.name,
    required this.doctorCount,
  });

  factory DepartmentModel.fromJson(Map<String, dynamic> json) {
    return DepartmentModel(
      id: json['_id'],
      name: json['name'],
      doctorCount: json["doctorCount"] ?? 0,
    );
  }
}
