import 'dart:io';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:image_picker/image_picker.dart';
import 'package:patient_app/features/auth/provider/auth_provider.dart';
import 'package:patient_app/features/reports/reports_screen.dart';
import 'package:patient_app/models/patient_model.dart';
import 'package:patient_app/features/profile/provider/patient_profile_provider.dart';
import 'package:patient_app/features/voice_assistant/voice_assistant_screen.dart';
import 'package:patient_app/utils/constants.dart';
import 'package:provider/provider.dart';

class PatientProfileScreen extends StatefulWidget {
  const PatientProfileScreen({super.key});

  @override
  State<PatientProfileScreen> createState() => _PatientProfileScreenState();
}

class _PatientProfileScreenState extends State<PatientProfileScreen> {

  // Load profile data when screen opens==========================================
  File? selectedImage;
  Future<void> pickImage() async {
  try {
    final picker = ImagePicker();

    final XFile? image = await picker.pickImage(
      source: ImageSource.gallery,
      imageQuality: 70,
    );

    if (image != null) {
      setState(() {
        selectedImage = File(image.path);
      });
    }
  } catch (e) {
    debugPrint("Image Pick Error: $e");
  }
}

  // void _showEditProfileSheet(BuildContext context, PatientModel patient) {
  //   final phoneController =TextEditingController(text: patient.phone ?? "");
  //   DateTime? selectedDob = patient.dob;
  //   String? selectedGender = patient.gender;
  //   String? selectedBlood = patient.bloodGroup;
    

  //   showModalBottomSheet(
  //     context: context,
  //     isScrollControlled: true,
  //     shape: RoundedRectangleBorder(
  //       borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
  //     ),
  //     builder: (_) {
  //       return Padding(
  //         padding: EdgeInsets.only(
  //           left: 16,
  //           right: 16,
  //           top: 20,
  //           bottom: MediaQuery.of(context).viewInsets.bottom + 20,
  //         ),
  //         child: Column(
  //           mainAxisSize: MainAxisSize.min,
  //           children: [

  //             const Text(
  //               "Edit Profile",
  //               style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
  //             ),

  //             const SizedBox(height: 16),

  //             // TextField(
  //             //   controller: ageController,
  //             //   keyboardType: TextInputType.number,
  //             //   decoration: const InputDecoration(
  //             //     labelText: "Age",
  //             //     border: OutlineInputBorder(),
  //             //   ),
  //             // ),
  //             Stack(
  //               children: [
  //                 CircleAvatar(
  //                   radius: 45,
  //                   backgroundImage: selectedImage != null
  //                       ? FileImage(selectedImage!)
  //                       : patient.profileImage != null
  //                           ? NetworkImage(patient.profileImage!)
  //                           : null,
  //                   child: selectedImage == null &&
  //                           patient.profileImage == null
  //                       ? const Icon(Icons.person, size: 40)
  //                       : null,
  //                 ),

  //                 Positioned(
  //                   bottom: 0,
  //                   right: 0,
  //                   child: GestureDetector(
  //                     onTap: pickImage,
  //                     child: Container(
  //                       padding: const EdgeInsets.all(6),
  //                       decoration: const BoxDecoration(
  //                         color: AppColors.primaryBlue,
  //                         shape: BoxShape.circle,
  //                       ),
  //                       child: const Icon(
  //                         Icons.camera_alt,
  //                         size: 18,
  //                         color: Colors.white,
  //                       ),
  //                     ),
  //                   ),
  //                 ),
  //               ],
  //             ),
  //             const SizedBox(height: 12),
  //             ListTile(
  //               leading: const Icon(Icons.cake),
  //               title: Text(
  //                 selectedDob != null
  //                     ? "${selectedDob!.day}/${selectedDob!.month}/${selectedDob!.year}"
  //                     : "Select DOB",
  //               ),
  //               onTap: () async {
  //                 final picked = await showDatePicker(
  //                   context: context,
  //                   initialDate: selectedDob ?? DateTime(2000),
  //                   firstDate: DateTime(1900),
  //                   lastDate: DateTime.now(),
  //                 );

  //                 if (picked != null) {
  //                   selectedDob = picked;
  //                 }
  //               },
  //             ),
  //             const SizedBox(height: 12),
  //             DropdownButtonFormField<String>(
  //               initialValue: selectedGender,
  //               decoration: const InputDecoration(
  //                 labelText: "Gender",
  //                 border: OutlineInputBorder(),
  //               ),
  //               items: const [
  //                 DropdownMenuItem(
  //                   value: "MALE",
  //                   child: Text("Male"),
  //                 ),
  //                 DropdownMenuItem(
  //                   value: "FEMALE",
  //                   child: Text("Female"),
  //                 ),
  //                 DropdownMenuItem(
  //                   value: "OTHER",
  //                   child: Text("Other"),
  //                 ),
  //               ],
  //               onChanged: (value) {
  //                 setState(() {
  //                   selectedGender = value;
  //                 });
  //               },
  //             ),

  //             const SizedBox(height: 12),

  //             DropdownButtonFormField<String>(
  //               value: selectedBlood,
  //               decoration: const InputDecoration(
  //                 labelText: "Blood Group",
  //                 border: OutlineInputBorder(),
  //               ),
  //               items: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]
  //                   .map((e) =>
  //                       DropdownMenuItem(value: e, child: Text(e)))
  //                   .toList(),
  //               onChanged: (val) {
  //                 selectedBlood = val;
  //               },
  //             ),

  //             const SizedBox(height: 12),

  //             TextField(
  //               controller: phoneController,
  //               keyboardType: TextInputType.phone,
  //               decoration: const InputDecoration(
  //                 labelText: "Phone Number",
  //                 border: OutlineInputBorder(),
  //               ),
  //             ),

  //             const SizedBox(height: 20),

  //             ElevatedButton(
  //               style: ElevatedButton.styleFrom(
  //                 minimumSize: const Size(double.infinity, 48),
  //               ),
  //               onPressed: () async {
  //                 final token =
  //                     context.read<AuthProvider>().token!;

  //                 await context.read<PatientProvider>().updateProfile(
  //                       token: token,
  //                       dob: selectedDob,
  //                       gender: selectedGender,
  //                       bloodGroup: selectedBlood,
  //                       phone: phoneController.text,
  //                     );
  //                 Navigator.pop(context);
  //               },
  //               child: const Text("Save Changes"),
  //             )
  //           ],
  //         ),
  //       );
  //     },
  //   );
  // }

  InputDecoration inputDecoration(String label) {
  return InputDecoration(
    labelText: label,
    labelStyle: const TextStyle(color: Colors.white70),
    filled: true,
    fillColor: Colors.white10,
    border: OutlineInputBorder(
      borderRadius: BorderRadius.circular(10),
    ),
    enabledBorder: OutlineInputBorder(
      borderSide: const BorderSide(color: Colors.white24),
      borderRadius: BorderRadius.circular(10),
    ),
  );
}
  
  void _showEditProfileDialog(BuildContext context, PatientModel patient) {
    final phoneController =
        TextEditingController(text: patient.phone ?? "");

    DateTime? selectedDob = patient.dob;
    String? selectedGender = patient.gender;
    String? selectedBlood = patient.bloodGroup;
    File? tempImage = selectedImage;

    showDialog(
      context: context,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setState) {
            return Dialog(
              backgroundColor: const Color(0xFF0C111A),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(20),
              ),
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: SingleChildScrollView(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      
                      Text(
                        "Edit Profile",
                        style: GoogleFonts.inter(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: AppColors.glowBlue,
                        ),
                      ),

                      const SizedBox(height: 16),

                      // ================= PROFILE IMAGE =================
                      Stack(
                        children: [
                          CircleAvatar(
                            radius: 45,
                            backgroundColor: Colors.grey.shade800,
                            backgroundImage: tempImage != null
                                ? FileImage(tempImage!)
                                : (patient.profileImage != null
                                    ? NetworkImage(patient.profileImage!)
                                    : null) as ImageProvider?,
                            child: tempImage == null &&
                                    patient.profileImage == null
                                ? const Icon(Icons.person,
                                    size: 40, color: Colors.white)
                                : null,
                          ),

                          Positioned(
                            bottom: 0,
                            right: 0,
                            child: GestureDetector(
                              onTap: () async {
                                final picker = ImagePicker();
                                final image = await picker.pickImage(
                                  source: ImageSource.gallery,
                                  imageQuality: 80,
                                );

                                if (image != null) {
                                  setState(() {
                                    tempImage = File(image.path);
                                  });
                                }
                              },
                              child: Container(
                                padding: const EdgeInsets.all(6),
                                decoration: const BoxDecoration(
                                  color: AppColors.primaryBlue,
                                  shape: BoxShape.circle,
                                ),
                                child: const Icon(
                                  Icons.camera_alt,
                                  size: 18,
                                  color: Colors.white,
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),

                      const SizedBox(height: 16),

                      // ================= DOB =================
                      ListTile(
                        tileColor: Colors.white10,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10),
                        ),
                        leading: const Icon(Icons.cake, color: Colors.white),
                        title: Text(
                          selectedDob != null
                              ? "${selectedDob!.day}/${selectedDob!.month}/${selectedDob!.year}"
                              : "Select DOB",
                          style: const TextStyle(color: Colors.white),
                        ),
                        onTap: () async {
                          final picked = await showDatePicker(
                            context: context,
                            initialDate: selectedDob ?? DateTime(2000),
                            firstDate: DateTime(1900),
                            lastDate: DateTime.now(),
                          );

                          if (picked != null) {
                            setState(() {
                              selectedDob = picked;
                            });
                          }
                        },
                      ),

                      const SizedBox(height: 12),

                      // ================= GENDER =================
                      DropdownButtonFormField<String>(
                        value: selectedGender,
                        dropdownColor: const Color(0xFF0C111A),
                        decoration: inputDecoration("Gender"),
                        items: const [
                          DropdownMenuItem(value: "MALE", child: Text("Male",style:TextStyle(color:Colors.white))),
                          DropdownMenuItem(value: "FEMALE", child: Text("Female",style:TextStyle(color:Colors.white))),
                          DropdownMenuItem(value: "OTHER", child: Text("Other",style:TextStyle(color:Colors.white))),
                        ],
                        onChanged: (val) {
                          setState(() {
                            selectedGender = val;
                          });
                        },
                      ),

                      const SizedBox(height: 12),

                      // ================= BLOOD =================
                      DropdownButtonFormField<String>(
                        value: selectedBlood,
                        dropdownColor: const Color(0xFF0C111A),
                        decoration: inputDecoration("Blood Group"),
                        items: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]
                            .map((e) => DropdownMenuItem(
                                  value: e,
                                  child: Text(e,
                                      style: const TextStyle(color: Colors.white)),
                                ))
                            .toList(),
                        onChanged: (val) {
                          setState(() {
                            selectedBlood = val;
                          });
                        },
                      ),

                      const SizedBox(height: 12),

                      // ================= PHONE =================
                      TextField(
                        controller: phoneController,
                        style: const TextStyle(color: Colors.white),
                        decoration: inputDecoration("Phone Number"),
                        keyboardType: TextInputType.phone,
                      ),

                      const SizedBox(height: 20),

                      // ================= SAVE BUTTON =================
                      ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.primaryBlue,
                          minimumSize: const Size(double.infinity, 45),
                        ),
                        onPressed: () async {
                          final token =
                              context.read<AuthProvider>().token!;

                          await context
                              .read<PatientProvider>()
                              .updateProfile(
                                token: token,
                                dob: selectedDob,
                                gender: selectedGender,
                                bloodGroup: selectedBlood,
                                phone: phoneController.text,
                                image: tempImage,
                              );

                          Navigator.pop(context);
                        },
                        child: const Text("Save Changes",style:TextStyle(color:Colors.white)),
                      )
                    ],
                  ),
                ),
              ),
            );
          },
        );
      },
    );
  }
  

  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      final token = context.read<AuthProvider>().token!;
      context.read<PatientProvider>().fetchProfile(token);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: Colors.black,
        title:  Text("Profile",style: GoogleFonts.poppins(
          color: Colors.white,
         ),),
        elevation: 0,
        actions: [
          Consumer<PatientProvider>(
            builder: (context, provider, _) {
              if (provider.patient == null) return const SizedBox();
              return IconButton(
                icon: const Icon(Icons.edit),
                onPressed: () {
                  _showEditProfileDialog(context, provider.patient!);
                },
              );
            },
          )
        ],
      ),
      body: Consumer<PatientProvider>(
        builder: (context, provider, _) {

          if (provider.loading) {
            return const Center(child: CircularProgressIndicator());
          }

          if (provider.error != null) {
            return Center(child: Text(provider.error!));
          }

          final patient = provider.patient;
          if (patient == null) {
            return const Center(child: Text("No profile data found"));
          }

          return SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                _profileCard(patient),
                const SizedBox(height: 16),
                _contactInfoCard(patient),
                SizedBox(height: 16,),
                _infoCard(patient),
                const SizedBox(height: 24),
                _quickActions(context),
              ],
            ),
          );
        },
      ),
    );
  }

//profile card=================================
Widget _profileCard(PatientModel patient) {
  return Container(
    margin: const EdgeInsets.only(top: 10),
    padding: const EdgeInsets.all(18),
    color: Colors.transparent,
    // decoration: BoxDecoration(
    //   color: const Color(0xFF0C111A),
    //   borderRadius: BorderRadius.circular(20),
    //   border: Border.all(
    //     color: AppColors.glowBlue.withOpacity(0.2),
    //   ),
    //   boxShadow: [
    //     BoxShadow(
    //       color: Colors.black.withOpacity(0.4),
    //       blurRadius: 18,
    //       offset: const Offset(0, 10),
    //     ),
    //   ],
    // ),
    child: Row(
      children: [
        // PROFILE IMAGE WITH GLOW
        Container(
          padding: const EdgeInsets.all(3),
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            boxShadow: [
              BoxShadow(
                color: Colors.blueAccent.withOpacity(0.4),
                blurRadius: 12,
                spreadRadius: 2,
              ),
            ],
          ),
          child: CircleAvatar(
            radius: 36,
            backgroundColor: Colors.grey.shade900,
            backgroundImage: patient.profileImage != null
                ? NetworkImage(patient.profileImage!)
                : null,
            child: patient.profileImage == null
                ? const Icon(Icons.person,
                    size: 34, color: Colors.white)
                : null,
          ),
        ),

        const SizedBox(width: 25),

        // DETAILS
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                patient.user.name,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 18,
                  fontWeight: FontWeight.w700,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                patient.user.email,
                style: const TextStyle(
                  color: Colors.white60,
                  fontSize: 13,
                ),
              ),
              const SizedBox(height: 10),

              Row(
                children: [
                  if (patient.bloodGroup != null)
                    _Chip(
                      label: patient.bloodGroup!,
                      icon: Icons.bloodtype,
                    ),
                ],
              ),
            ],
          ),
        ),

        // EDIT BUTTON (SMALL & CLEAN)
        Container(
          decoration: BoxDecoration(
            color: AppColors.glowBlue.withOpacity(0.1),
            borderRadius: BorderRadius.circular(10),
          ),
          child: IconButton(
            icon: const Icon(Icons.edit, color: Colors.white, size: 18),
            onPressed: () {
              _showEditProfileDialog(context, patient);
            },
          ),
        ),
      ],
    ),
  );
}

  // ================= INFO CARD =================
  Widget _infoCard(PatientModel patient) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical:16,horizontal: 16),
      decoration: BoxDecoration(
        //color: const Color.fromARGB(255, 12, 17, 26),
        gradient: 
        const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            
            Color(0xFF161D2B),
            Color(0xFF0E1522),
            Color.fromARGB(255, 12, 17, 26),
          ],
        ), 
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        crossAxisAlignment:CrossAxisAlignment.start ,
        children: [
          Text(
            "Personal Information",
            style:GoogleFonts.inter(
              fontSize: 16,
              color: AppColors.glowBlue,
            )
            ,),
          SizedBox(height: 10,),
          _InfoRow(
            icon: Icons.cake,
            label: "Date of Birth",
            value: patient.dob != null
                ? "${patient.dob!.day}/${patient.dob!.month}/${patient.dob!.year}"
                : "-",
          ),
          gradientDivider(),
          _InfoRow(
            icon: Icons.bloodtype_sharp,
            label: "Blood Group",
            value: patient.bloodGroup ?? "-",
          ),
          gradientDivider(),
          _InfoRow(
            icon: Icons.person,
            label: "Gender",
            value: patient.gender ?? "-",
          ),
          gradientDivider(),
          _InfoRow(
            icon: Icons.home,
            label: "Address",
            value: patient.phone ?? "-",
          ),
        ],
      ),
    );
  }

  //==============================
  // ================= INFO CARD =================
  Widget _contactInfoCard(PatientModel patient) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical:16,horizontal: 16),
      decoration: BoxDecoration(
        //color: const Color.fromARGB(255, 12, 17, 26),
        gradient: 
        const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            
            Color(0xFF161D2B),
            Color(0xFF0E1522),
            Color.fromARGB(255, 12, 17, 26),
          ],
        ),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        crossAxisAlignment:CrossAxisAlignment.start ,
        children: [
          Text(
            "Contact Information",
            style:GoogleFonts.inter(
              fontSize: 16,
              color: AppColors.glowBlue,
            )
            ,),
          SizedBox(height: 10,),
          _InfoRow(
            icon: Icons.mail,
            label: "Email",
            value: patient.user.email ,
          ),
          gradientDivider(),
          _InfoRow(
            icon: Icons.phone,
            label: "Phone Number",
            value: patient.phone ?? "-",
          ),
        ],
      ),
    );
  }


  // ================= QUICK ACTIONS =================
  Widget _quickActions(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
         Text(
          "Quick Actions",
          style: GoogleFonts.inter(
            fontSize: 16,
            color: AppColors.glowBlue,
          ),
        ),
        const SizedBox(height: 16),
        _ActionTile(
          icon: Icons.description,
          title: "My Reports",
          subtitle: "View lab results & diagnostics",
          color: Colors.blue,
          onTap: () {
            Navigator.of(context).push(
              MaterialPageRoute(
                builder: (context) => MyReportsScreen(),
              ),
            );
          },
        ),
        const SizedBox(height: 12),
        _ActionTile(
          icon: Icons.medical_services,
          title: "My Prescriptions",
          subtitle: "Medications & treatment plans",
          color: Colors.green,
          onTap: () {
            Navigator.pushNamed(context, "/my-prescriptions");
          },
        ),
        const SizedBox(height: 12),
        _ActionTile(
          icon: Icons.mic,
          title: "AI Health Assistant",
          subtitle: "Talk through your symptoms",
          color: Colors.purple,
          onTap: () {
            Navigator.of(context).push(VoiceAssistantScreen.route());
          },
        ),
      ],
    );
  }
}

@override
Widget gradientDivider({
  double height = 2,
  EdgeInsets padding = const EdgeInsets.symmetric(vertical: 9),
  List<Color>? colors,
}) {
  return Padding(
    padding: padding,
    child: Container(
      height: height,
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: colors ??
              [
                Colors.transparent,
                Colors.blueAccent,
                Colors.blue,
                Colors.transparent,
              ],
        ),
      ),
    ),
  );
}

/* ================= REUSABLE WIDGETS ================= */

class _InfoRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;

  const _InfoRow({
    required this.icon,
    required this.label,
    required this.value,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        CircleAvatar(
          radius: 18,
          backgroundColor: const Color.fromARGB(255, 21, 87, 230).withAlpha(40),
          child: Icon(icon, color: AppColors.glowBlue, size: 20),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label, style: const TextStyle(color: Colors.grey,fontSize: 13)),
              SizedBox(height: 3.5,),
              Text(
                value,
                style: const TextStyle(fontSize: 15,color: Colors.white),
              ),
            ],
          ),
        )
      ],
    );
  }
}

class _ActionTile extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final Color color;
  final VoidCallback onTap;

  const _ActionTile({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: const Color.fromARGB(255, 12, 17, 26),
          borderRadius: BorderRadius.circular(16),
        ),
        child: Row(
          children: [
            CircleAvatar(
              radius: 22,
              backgroundColor: color.withOpacity(0.1),
              child: Icon(icon, color: color),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title,
                      style:  GoogleFonts.inter(fontWeight: FontWeight.bold,color: Colors.white)),
                  const SizedBox(height: 4),
                  Text(subtitle,
                      style: const TextStyle(color: Colors.grey,fontSize: 13)),
                ],
              ),
            ),
            const Icon(Icons.arrow_forward_ios, size: 16,color: Colors.grey,),
          ],
        ),
      ),
    );
  }
}

class _Chip extends StatelessWidget {
  final String label;
  final IconData icon;

  const _Chip({required this.label, required this.icon});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.2),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: Colors.white),
          const SizedBox(width: 4),
          Text(label, style: const TextStyle(color: Colors.white)),
        ],
      ),
    );
  }
}
