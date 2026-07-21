import 'package:flutter/material.dart';
import 'package:patient_app/features/auth/provider/auth_provider.dart';
import 'package:patient_app/features/hospitals/provider/review_provider.dart';
import 'package:patient_app/helpers/format_review_time.dart';
import 'package:provider/provider.dart';

class PatientReviews extends StatefulWidget {
  final String hospitalId;
  const PatientReviews({super.key, required this.hospitalId});

  @override
  State<PatientReviews> createState() => _PatientReviewsState();
}

class _PatientReviewsState extends State<PatientReviews> {
  bool _prefilled = false;
  int selectedRating = 0;
  final TextEditingController feedbackController = TextEditingController();
  @override
  void dispose() {
    feedbackController.dispose();
    super.dispose();
  }

  @override
  void initState() {
    super.initState();
    print("PatientReviews initState => ${widget.hospitalId}");
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final token =context.read<AuthProvider>().token!;
      final reviewProvider = context.read<ReviewProvider>();

          reviewProvider.clearReviews();
          _prefilled = false;
          selectedRating = 0;
          feedbackController.clear();

          reviewProvider.getHospitalReviews(
            hospitalId: widget.hospitalId,
            token: token,
          );

    });
  }

  bool _validateReview() {
    if (selectedRating == 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text("Please select a rating"),
        ),
      );
      return false;
    }

    if (feedbackController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text("Please write your feedback"),
        ),
      );
      return false;
    }

    return true;
  }
  

  Future<void> _submitReview() async {
    if (!_validateReview()) return;

    final reviewProvider = context.read<ReviewProvider>();
    final token = context.read<AuthProvider>().token!;

    final isEditing = reviewProvider.hasReviewed;

    final success = isEditing
        ? await reviewProvider.editReview(
            hospitalId: widget.hospitalId,
            token: token,
            rating: selectedRating,
            feedback: feedbackController.text.trim(),
          )
        : await reviewProvider.addReview(
            hospitalId: widget.hospitalId,
            token: token,
            rating: selectedRating,
            feedback: feedbackController.text.trim(),
          );

    if (!mounted) return;

    if (success) {
      _prefilled = false;

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            isEditing
                ? "Review updated successfully"
                : "Review submitted successfully",
          ),
        ),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            reviewProvider.error ?? "Something went wrong",
          ),
        ),
      );
    }
  }




  @override
  Widget build(BuildContext context) {
    
    
    final reviewProvider = context.watch<ReviewProvider>();
    final authProvider = context.read<AuthProvider>();
    final reviewData = reviewProvider.hospitalReview;
    //final myReview = reviewProvider.myReview;
    print("selectedRating = $selectedRating");
    print("feedback = ${feedbackController.text}");
    print("provider myReview = ${reviewProvider.myReview}");
    print("Hospital = ${widget.hospitalId}");
print("Provider Hospital = ${reviewProvider.hospitalReview?.hospital.id}");
print("Provider myReview = ${reviewProvider.myReview}");


    

    if (reviewProvider.isFetching) {
      return const Center(
        child: CircularProgressIndicator(),
      );
    }
    return SingleChildScrollView(
      child: Column(
        children: [
          //================ REVIEW CARD =================
          Container(
            decoration: BoxDecoration(
              color: const Color(0xff0C1323),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: Colors.white.withOpacity(.06)),
            ),
            child: Column(
              children: [
                const SizedBox(height: 15),

                const Padding(
                  padding: EdgeInsets.symmetric(horizontal: 18),
                  child: Align(
                    alignment: Alignment.centerLeft,
                    child: Text(
                      "Patient Reviews",
                      style: TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.w600,
                        fontSize: 17,
                      ),
                    ),
                  ),
                ),

                const SizedBox(height: 20),

                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 18),
                  child: Row(
                    children: [
                      //--------------------------------
                      // Left Rating
                      //--------------------------------
                      Column(
                        children: [
                           Text(
                            reviewData?.hospital.averageRating.toStringAsFixed(1) ??"0.0",
                            style: TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                              fontSize: 46,
                            ),
                          ),

                          Row(
                            children: List.generate(
                              5,
                              (index) => const Icon(
                                Icons.star,
                                color: Colors.amber,
                                size: 18,
                              ),
                            ),
                          ),

                          const SizedBox(height: 6),

                          Text(
                            "(${reviewData?.hospital.totalReviews ?? 0} Reviews)",
                            style: TextStyle(
                              color: Colors.grey.shade500,
                              fontSize: 12,
                            ),
                          ),
                        ],
                      ),

                      const SizedBox(width: 30),

                      //--------------------------------
                      // Rating Bars
                      //--------------------------------
                      Expanded(
                        child: Column(
                          children: List.generate(5, (index) {
                            final star = 5 - index;

                            final count =
                                reviewData?.ratingDistribution["$star"] ?? 0;

                            final total =
                                reviewData?.hospital.totalReviews ?? 0;

                            return Padding(
                              padding: const EdgeInsets.only(bottom: 10),
                              child: RatingBarRow(
                                star: star,
                                count: count,
                                percent:
                                    total == 0 ? 0 : count / total,
                              ),
                            );
                          }),
                        )
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 15),

                Divider(color: Colors.white.withOpacity(.06)),

                // const ReviewTile(
                //   avatarLetter: "A",
                //   avatarColor: Colors.deepPurple,
                //   name: "Anjali Sharma",
                //   time: "2 days ago",
                //   review:
                //       "Great experience! The staff is very supportive and the doctors are highly experienced.",
                // ),

                // Divider(color: Colors.white.withOpacity(.06)),

                // const ReviewTile(
                //   avatarLetter: "R",
                //   avatarColor: Colors.teal,
                //   name: "Rohit Verma",
                //   time: "1 week ago",
                //   review:
                //       "Good hospital with all the necessary facilities. Waiting time can be improved.",
                // ),

                ...(reviewData?.reviews ?? []).map(
                  (review) => Column(
                    children: [

                      // Divider(
                      //   color: Colors.white.withOpacity(.06),
                      // ),

                      ReviewTile(
                        avatarLetter:
                            review.username[0].toUpperCase(),

                        avatarColor: Colors.blue,

                        name: review.username,

                        time: formatReviewTime(
                          review.createdAt,
                        ),

                        review: review.feedback,

                        rating: review.rating,
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 15),
              ],
            ),
          ),

          const SizedBox(height: 18),

          //================ RATE EXPERIENCE =================
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: const Color(0xff0C1323),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: Colors.white.withOpacity(.06)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  "Rate Your Experience",
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),

                const SizedBox(height: 6),

                Text(
                  "Share your feedback to help us improve",
                  style: TextStyle(color: Colors.grey.shade500),
                ),

                const SizedBox(height: 20),

                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: List.generate(
                    5,
                    (index) => GestureDetector(
                      onTap: () {
                        setState(() {
                          selectedRating = index + 1;
                        });
                      },
                      child: Icon(
                        index < selectedRating
                            ? Icons.star
                            : Icons.star_border,
                        color: Colors.amber,
                        size: 34,
                      ),
                    ),
                  ),
                ),

                const SizedBox(height: 22),

                TextField(
                  maxLines: 3,
                  controller: feedbackController,
                  style: const TextStyle(color: Colors.white),
                  decoration: InputDecoration(
                    hintText: "Write your feedback...",
                    hintStyle: TextStyle(color: Colors.grey.shade500),
                    filled: true,
                    fillColor: const Color(0xff141D30),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide.none,
                    ),
                  ),
                ),

                const SizedBox(height: 18),

                SizedBox(
                  width: double.infinity,
                  height: 50,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xff2979FF),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    onPressed: () async {
                      await _submitReview();
                    },
                    child:  Text(
                      reviewProvider.hasReviewed
                      ? "Update Review"
                      : "Submit Review",
                      style: TextStyle(fontSize: 16),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class RatingBarRow extends StatelessWidget {
  final int star;
  final double percent;
  final int count;

  const RatingBarRow({
    super.key,
    required this.star,
    required this.percent,
    required this.count,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        SizedBox(
          width: 20,
          child: Text("$star", style: const TextStyle(color: Colors.white70)),
        ),

        const Icon(Icons.star, color: Colors.amber, size: 13),

        const SizedBox(width: 8),

        Expanded(
          child: ClipRRect(
            borderRadius: BorderRadius.circular(20),
            child: LinearProgressIndicator(
              value: percent,
              minHeight: 7,
              backgroundColor: Colors.white10,
              valueColor: const AlwaysStoppedAnimation(Color(0xff2979FF)),
            ),
          ),
        ),

        const SizedBox(width: 10),

        SizedBox(
          width: 35,
          child: Text(
            "$count",
            style: const TextStyle(color: Colors.white60, fontSize: 12),
          ),
        ),
      ],
    );
  }
}

class ReviewTile extends StatelessWidget {
  final String avatarLetter;
  final Color avatarColor;
  final String name;
  final String time;
  final String review;
  final int rating;

  const ReviewTile({
    super.key,
    required this.avatarLetter,
    required this.avatarColor,
    required this.name,
    required this.time,
    required this.review,
    required this.rating,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          CircleAvatar(
            radius: 20,
            backgroundColor: avatarColor,
            child: Text(
              avatarLetter,
              style: const TextStyle(color: Colors.white),
            ),
          ),

          const SizedBox(width: 12),

          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text(
                      name,
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                      ),
                    ),

                    const Spacer(),

                    const Icon(Icons.more_horiz, color: Colors.white54),
                  ],
                ),

                Text(
                  time,
                  style: const TextStyle(color: Colors.white54, fontSize: 12),
                ),

                const SizedBox(height: 4),

                Row(
                  children: List.generate(
                    5,
                    (index) => Icon(
                      index < rating
                          ? Icons.star
                          : Icons.star_border,
                      size: 15,
                      color: Colors.amber,
                    ),
                  ),
                ),
                const SizedBox(height: 8),

                Text(
                  review,
                  style: const TextStyle(color: Colors.white70, height: 1.4),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
