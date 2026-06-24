import 'package:flutter/material.dart';

class HospitalCard extends StatelessWidget {
  final String hospitalName;
  final String imagePath;
  final String distance;
  final String availability;
  final VoidCallback onView;

  const HospitalCard({
    super.key,
    required this.hospitalName,
    required this.imagePath,
    required this.distance,
    required this.availability,
    required this.onView,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color.fromARGB(255, 12, 17, 26),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(
          color: Colors.grey,
          width: 0.2,
        ),
        
      ),
      child: Row(
        children: [
          ClipRRect(
            borderRadius: BorderRadius.circular(14),
            child: Image.asset(
              imagePath,
              height: 70,
              width: 70,
              fit: BoxFit.cover,
            ),
          ),

          const SizedBox(width: 12),

          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Flexible(
                      child: Text(
                        hospitalName,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 18,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                    const SizedBox(width: 4),
                    const Icon(
                      Icons.verified,
                      color: Colors.blue,
                      size: 18,
                    ),
                  ],
                ),

                const SizedBox(height: 4),

                Text(
                  distance,
                  style: TextStyle(
                    color: Colors.grey.shade400,
                  ),
                ),

                const SizedBox(height: 4),

                Text(
                  availability,
                  style: const TextStyle(
                    color: Colors.green,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),

          ElevatedButton(
            onPressed: onView,
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF0F4CFF),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(14),
              ),
            ),
            child: const Text("View",style: TextStyle(color: Colors.white, fontSize: 14),),
          ),
        ],
      ),
    );
  }
}