import 'package:flutter/material.dart';
import 'package:patient_app/features/departments/provider/department_provider.dart';
import 'package:provider/provider.dart';

class DepartmentScreen extends StatefulWidget {
  final String hospitalId;

  const DepartmentScreen({super.key, required this.hospitalId});

  @override
  State<DepartmentScreen> createState() => _DepartmentScreenState();
}

class _DepartmentScreenState extends State<DepartmentScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      context.read<DepartmentProvider>()
          .fetchDepartments(widget.hospitalId);
    });
  }


  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<DepartmentProvider>(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text("Departments"),
      ),
      body: provider.isLoading
          ? const Center(child: CircularProgressIndicator())
          : GridView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: provider.departments.length,
              gridDelegate:
                  const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                crossAxisSpacing: 16,
                mainAxisSpacing: 16,
                childAspectRatio: 1,
              ),
              itemBuilder: (context, index) {
                final dept = provider.departments[index];

                return GestureDetector(
                  onTap: () {
                    // Navigator.push(
                    //   context,
                    //   MaterialPageRoute(
                    //     builder: (_) => DoctorListScreen(
                    //       hospitalId: widget.hospitalId,
                    //       departmentId: dept.id,
                    //       //token: context.read<AuthProvider>().token!, // ya jo bhi tum use kar rhi ho
                    //     ),
                    //   ),
                    // );
                  },

                  child: Container(
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.05),
                          blurRadius: 10,
                        ),
                      ],
                    ),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        CircleAvatar(
                          radius: 28,
                          backgroundColor: Colors.blue.shade50,
                          child: Icon(
                            Icons.local_hospital,
                            color: Colors.blue,
                          ),
                        ),
                        const SizedBox(height: 12),
                        Text(
                          dept.name,
                          textAlign: TextAlign.center,
                          style: const TextStyle(
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
    );
  }
}
