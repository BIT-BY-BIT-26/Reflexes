class ReportModel {
  final String id;
  final String title;
  final String type;
  final String file;
  final String fileType;
  final DateTime createdAt;

  ReportModel({
    required this.id,
    required this.title,
    required this.type,
    required this.file,
    required this.fileType,
    required this.createdAt,
  });

  factory ReportModel.fromJson(Map<String, dynamic> json) {
    return ReportModel(
      id: json['id'],
      title: json['title'],
      type: json['type'],
      file: json['filePublicId']??"",
      fileType: json['fileType']??"",
      createdAt: DateTime.parse(json['uploadedAt']),
    );
  }
}
