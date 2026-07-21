class ReviewModel {
  final String id;
  final String username;
  final int rating;
  final String feedback;
  final DateTime createdAt;

  ReviewModel({
    required this.id,
    required this.username,
    required this.rating,
    required this.feedback,
    required this.createdAt,
  });

  factory ReviewModel.fromJson(Map<String, dynamic> json) {
    return ReviewModel(
      id: json["_id"],
      username: json["username"] ?? "",
      rating: json["rating"],
      feedback: json["feedback"] ?? "",
      createdAt: DateTime.parse(json["createdAt"]),
    );
  }
}