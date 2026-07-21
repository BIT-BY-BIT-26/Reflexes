import 'package:carousel_slider/carousel_slider.dart';
import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:patient_app/features/departments/provider/department_provider.dart';
import 'package:patient_app/features/doctors/doctor_screen.dart';
import 'package:patient_app/features/hospitals/hospital_review.dart';
import 'package:patient_app/features/hospitals/provider/hospital_provider.dart';
import 'package:patient_app/utils/constants.dart';
import 'package:patient_app/utils/dept_icons.dart';
import 'package:provider/provider.dart';


class HospitalProfileScreen extends StatefulWidget {
  final String hospitalId;

  const HospitalProfileScreen({
    super.key,
    required this.hospitalId,
  });

  @override
  State<HospitalProfileScreen> createState() =>
      _HospitalProfileScreenState();
}

class _HospitalProfileScreenState extends State<HospitalProfileScreen> {


  @override
  void initState() {
    super.initState();

    WidgetsBinding.instance.addPostFrameCallback((_) {
      context
          .read<HospitalProvider>()
          .fetchHospitalProfile(widget.hospitalId);
      context.read<DepartmentProvider>()
        .fetchDepartments(widget.hospitalId);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: Consumer<HospitalProvider>(
        builder: (_, provider, __) {
      
          if (provider.profileLoading) {
            return const Center(
              child: CircularProgressIndicator(),
            );
          }
      
          if (provider.hospitalProfile == null) {
            return Center(
              child: Text(
                provider.profileError ?? "Hospital not found",
                style: const TextStyle(color: Colors.white),
              ),
            );
          }
      
          final hospital = provider.hospitalProfile!;
      
          return CustomScrollView(
            slivers: [
      
              /// COVER SECTION
              SliverToBoxAdapter(
                child: Stack(
                  clipBehavior: Clip.none,
                  children: [
      
                      Container(
                        height: 310,
                        decoration: BoxDecoration(
                          //color: AppColors.card,
                        ),
                        child: hospital.coverImage.trim().isEmpty
                           ? Transform.translate(
                              offset: const Offset(0, -85), // image 40 px upar
                              child: Image.asset(
                                "assets/animations/placeholder.png",
                                fit: BoxFit.cover,
                                width: double.infinity,
                                //height: 300,
                              ),
                            )
                            : Image.network(
                                hospital.coverImage,
                                fit: BoxFit.fill,
                                width: double.infinity,
                                errorBuilder: (_, __, ___) {
                                  return Image.asset(
                                    "assets/animations/placeholder.png",
                                    fit: BoxFit.cover,
                                    width: double.infinity,
                                  );
                                },
                              ),
                            ),
      
                    // Container(
                    //   height: 260,
                    //   decoration: BoxDecoration(
                    //     gradient: LinearGradient(
                    //       begin: Alignment.topCenter,
                    //       end: Alignment.bottomCenter,
                    //       colors: [
                    //         Colors.transparent,
                    //         AppColors.background.withOpacity(.95),
                    //       ],
                    //     ),
                    //   ),
                    // ),
      
                    Positioned(
                      top: 40,
                      left: 16,
                      child: CircleAvatar(
                        backgroundColor: AppColors.card,
                        child: IconButton(
                          icon: const Icon(
                            Icons.arrow_back,
                            color: Colors.white,
                          ),
                          onPressed: () => Navigator.pop(context),
                        ),
                      ),
                    ),
      
                    Positioned(
                      bottom: -55,
                      left: 20,
                      right: 20,
                      child: Container(
                        padding: const EdgeInsets.all(18),
                        decoration: BoxDecoration(
                          color: AppColors.card,
                          borderRadius: BorderRadius.circular(24),
                          border: Border.all(
                            color: AppColors.border,
                          ),
                        ),
                        child: Row(
                          children: [
      
                            Container(
                              height: 80,
                              width: 80,
                              decoration: BoxDecoration(
                                borderRadius:
                                    BorderRadius.circular(18),
                                border: Border.all(
                                  color: AppColors.primaryBlue,
                                  width: 2,
                                ),
                              ),
                              child: ClipRRect(
                                borderRadius: BorderRadius.circular(18),
                                child: hospital.logo.trim().isEmpty
                                    ? Container(
                                        color: AppColors.card,
                                        child: const Center(
                                          child: FaIcon(
                                            FontAwesomeIcons.hospital,
                                            color: Colors.white54,
                                            size: 34,
                                          ),
                                        ),
                                      )
                                    : Image.network(
                                        hospital.logo,
                                        fit: BoxFit.cover,
                                        errorBuilder: (_, __, ___) {
                                          return Container(
                                            color: AppColors.card,
                                            child: const Center(
                                              child: FaIcon(
                                                FontAwesomeIcons.hospital,
                                                color: Colors.white54,
                                                size: 34,
                                              ),
                                            ),
                                          );
                                        },
                                      ),
                              )
                            ),
      
                            const SizedBox(width: 14),
      
                            Expanded(
                              child: Column(
                                crossAxisAlignment:
                                    CrossAxisAlignment.start,
                                children: [
      
                                  Text(
                                    hospital.name,
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontSize: 20,
                                      fontWeight:
                                          FontWeight.bold,
                                    ),
                                  ),
      
                                  const SizedBox(height: 6),
      
                                  Text(
                                    "Multi Speciality Hospital",
                                    style: TextStyle(
                                      color: AppColors.grey,
                                    ),
                                  ),
      
                                  const SizedBox(height: 8),
      
                                  Row(
                                    children: [
      
                                      Icon(
                                        Icons.location_on,
                                        color:
                                            AppColors.glowBlue,
                                        size: 16,
                                      ),
      
                                      const SizedBox(width: 4),
      
                                      Text(
                                        hospital.city,
                                        style: TextStyle(
                                          color:
                                              AppColors.grey,
                                        ),
                                      ),
      
                                      const SizedBox(width: 10),
      
                                      Container(
                                        width: 6,
                                        height: 6,
                                        decoration:
                                            const BoxDecoration(
                                          color:
                                              AppColors.success,
                                          shape:
                                              BoxShape.circle,
                                        ),
                                      ),
      
                                      const SizedBox(width: 5),
      
                                      Text(
                                        hospital.isActive == true
                                            ? "Open"
                                            : "Closed",
                                        style: TextStyle(
                                          color:
                                              AppColors.success,
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
      
              const SliverToBoxAdapter(
                child: SizedBox(height: 80),
              ),
      
              SliverToBoxAdapter(
                child: Padding(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 16),
                  child: Column(
                    children: [
      
                      /// ACTIONS
                      Row(
                        children: [
      
                          Expanded(
                            child: _actionCard(
                              Icons.call,
                              "Call",
                            ),
                          ),
      
                          const SizedBox(width: 12),
      
                          Expanded(
                            child: _actionCard(
                              Icons.location_on,
                              "Directions",
                            ),
                          ),
      
                          const SizedBox(width: 12),
      
                          Expanded(
                            child: _actionCard(
                              Icons.language,
                              "Website",
                            ),
                          ),
                        ],
                      ),
      
                      const SizedBox(height: 20),
      
                      /// ADDRESS
                      _infoCard(
                        title: "Address",
                        value:
                            "${hospital.address}, ${hospital.city}, ${hospital.state} - ${hospital.pincode}",
                        icon: Icons.location_on,
                      ),
      
                      const SizedBox(height: 12),
      
                      _infoCard(
                        title: "Contact Info",
                        value:
                            "${hospital.phoneNumber}\n${hospital.email}",
                        icon: Icons.phone,
                      ),
      
                      const SizedBox(height: 20),
      
                      /// DESCRIPTION
                      if (hospital.description.trim().isNotEmpty) ...[
                        _sectionTitle("About Hospital"),
      
                        const SizedBox(height: 10),
      
                        Container(
                          width: double.infinity,
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: AppColors.card,
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Text(
                            hospital.description,
                            style: TextStyle(
                              color: AppColors.grey,
                              height: 1.6,
                            ),
                          ),
                        ),
      
                        const SizedBox(height: 24),
                      ],
      
                      /// DEPARTMENTS
                      _sectionTitle("Departments"),
      
                      const SizedBox(height: 12),
      
                      Consumer<DepartmentProvider>(
                        builder: (_, deptProvider, __) {
      
                          if (deptProvider.isLoading) {
                            return const Center(
                              child: CircularProgressIndicator(),
                            );
                          }
                          if (deptProvider.departments.isEmpty) {
                            return const Center(
                              child: (Text("No Departments yet",style: TextStyle(color: Colors.grey),)),
                            );
                          }
      
                          return GridView.builder(
                            shrinkWrap: true,
                            physics: const NeverScrollableScrollPhysics(),
                            itemCount: deptProvider.departments.length,
                            gridDelegate:
                                const SliverGridDelegateWithFixedCrossAxisCount(
                              crossAxisCount: 2,
                              crossAxisSpacing: 12,
                              mainAxisSpacing: 12,
                              childAspectRatio: 2.6,
                            ),
                            itemBuilder: (_, index) {
      
                              final department = deptProvider.departments[index];
      
                              return GestureDetector(
                                onTap: (){
                                  Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (_) => DoctorListScreen(
                                      hospitalId: widget.hospitalId,
                                      departmentId: department.id,
                                      //token: context.read<AuthProvider>().token!, // ya jo bhi tum use kar rhi ho
                                    ),
                                  ),
                                );
                              },
                               
                                child: Container(
                                  padding: const EdgeInsets.all(12),
                                  decoration: BoxDecoration(
                                    color: AppColors.card,
                                    borderRadius: BorderRadius.circular(16),
                                    border: Border.all(
                                      color: AppColors.border,
                                    ),
                                  ),
                                  child: Row(
                                    children: [
                                  
                                      FaIcon(
                                        DepartmentIcons.getIcon(department.name),
                                        color: AppColors.primaryBlue,
                                      ),
                                  
                                      const SizedBox(width: 16),
                                  
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          mainAxisAlignment: MainAxisAlignment.center,
                                          children: [
                                            Text(
                                              department.name,
                                              style: const TextStyle(
                                                color: Colors.white,
                                              ),
                                            ),
                                            Text(
                                              "${department.doctorCount} doctors",
                                              style: const TextStyle(
                                                color: AppColors.glowBlue,
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                
                                      Icon(Icons.arrow_forward_ios,size: 20,color: Colors.grey,),
                                
                                    ],
                                  ),
                                ),
                              );
                            },
                          );
                        },
                      ),
      
                      const SizedBox(height: 24),
      
                      // /// FACILITIES
                      // _sectionTitle("Facilities"),
      
                      //const SizedBox(height: 12),
      
                      // Wrap(
                      //   spacing: 8,
                      //   runSpacing: 8,
                      //   children: hospital.facilities
                      //       .map(
                      //         (e) => Container(
                      //           padding:
                      //               const EdgeInsets.symmetric(
                      //             horizontal: 14,
                      //             vertical: 8,
                      //           ),
                      //           decoration: BoxDecoration(
                      //             color: AppColors.card,
                      //             borderRadius:
                      //                 BorderRadius.circular(
                      //                     50),
                      //           ),
                      //           child: Text(
                      //             e,
                      //             style: TextStyle(
                      //               color:
                      //                   AppColors.glowBlue,
                      //             ),
                      //           ),
                      //         ),
                      //       )
                      //       .toList(),
                      // ),
      
                      //const SizedBox(height: 24),
      
                      /// GALLERY
                      // _sectionTitle("Hospital Gallery"),
      
                      // const SizedBox(height: 12),
      
                      // CarouselSlider(
                      //   options: CarouselOptions(
                      //     height: 220,
                      //     autoPlay: true,
                      //     enlargeCenterPage: true,
                      //   ),
                      //   items: galleryImages.map((url) {
                      //     return ClipRRect(
                      //       borderRadius:
                      //           BorderRadius.circular(20),
                      //       child: Image.network(
                      //         url,
                      //         fit: BoxFit.cover,
                      //         width: double.infinity,
                      //       ),
                      //     );
                      //   }).toList(),
                      // ),
      
                      if (hospital.galleryImages.isNotEmpty) ...[
                        _sectionTitle("Hospital Gallery"),
      
                        const SizedBox(height: 12),
      
                        CarouselSlider(
                          options: CarouselOptions(
                            height: 220,
                            autoPlay: hospital.galleryImages.length > 1,
                            enlargeCenterPage: true,
                            autoPlayCurve: Curves.easeInOut
                            //viewportFraction: 0.9,
                          ),
                          items: hospital.galleryImages.map((url) {
                            return ClipRRect(
                              borderRadius: BorderRadius.circular(20),
                              child: Image.network(
                                url,
                                fit: BoxFit.cover,
                                width: double.infinity,
                                errorBuilder: (_, __, ___) {
                                  return Container(
                                    color: AppColors.card,
                                    child: const Center(
                                      child: Icon(
                                        Icons.broken_image,
                                        color: Colors.white54,
                                        size: 40,
                                      ),
                                    ),
                                  );
                                },
                              ),
                            );
                          }).toList(),
                        ),
      
                        const SizedBox(height: 24),
                      ],
                      PatientReviews(hospitalId: hospital.id)
                    ],
                  ),
                ),
              ),
            ],
          );
        },
      ),
    );
  }

  Widget _sectionTitle(String title) {
    return Align(
      alignment: Alignment.centerLeft,
      child: Text(
        title,
        style: const TextStyle(
          color: Colors.white,
          fontSize: 18,
          fontWeight: FontWeight.w700,
        ),
      ),
    );
  }

  Widget _actionCard(
    IconData icon,
    String title,
  ) {
    return Container(
      height: 70,
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(18),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, color: AppColors.primaryBlue),
          const SizedBox(height: 6),
          Text(
            title,
            style: TextStyle(
              color: AppColors.grey,
            ),
          ),
        ],
      ),
    );
  }

  Widget _infoCard({
    required String title,
    required String value,
    required IconData icon,
  }) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [

          Icon(
            icon,
            color: AppColors.primaryBlue,
          ),

          const SizedBox(width: 12),

          Expanded(
            child: Column(
              crossAxisAlignment:
                  CrossAxisAlignment.start,
              children: [

                Text(
                  title,
                  style: TextStyle(
                    color: AppColors.grey,
                  ),
                ),

                const SizedBox(height: 6),

                Text(
                  value,
                  style: const TextStyle(
                    color: Colors.white,
                    height: 1.5,
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