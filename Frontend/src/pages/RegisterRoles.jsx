// import React from "react";
// import { Box, Paper, Typography, Button } from "@mui/material";
// import { useNavigate } from "react-router-dom";

// const RegisterRole = () => {
//   const navigate = useNavigate();

//   return (
//     <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
//       <Paper sx={{ p: 4, width: 400, textAlign: "center" }}>
//         <Typography variant="h5" mb={3} fontWeight={600}>
//           Select Registration Type
//         </Typography>

//         <Button
//           fullWidth
//           variant="contained"
//           sx={{ mb: 2 }}
//           onClick={() => navigate("/register")}
//         >
//           Hospital / Admin
//         </Button>

//         <Button
//           fullWidth
//           variant="contained"
//           sx={{ mb: 2 }}
//           onClick={() => navigate("/register-pharmacy")}
//         >
//           Pharmacy / Shopkeeper
//         </Button>
//       </Paper>
//     </Box>
//   );
// };

// export default RegisterRole;



import React from "react";
import { Box, Paper, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const MotionPaper = motion(Paper);
const MotionButton = motion(Button);

const RegisterRole = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        minWidth:"100vw",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #290263, #1c093b, #7c3aed)",
      }}
    >
      <MotionPaper
        initial={{ opacity: 0, y: 60, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6 }}
        elevation={10}
        sx={{
          p: 5,
          width: 420,
          borderRadius: 4,
          textAlign: "center",
          backdropFilter: "blur(15px)",
          background: "rgba(255,255,255,0.08)",
          color: "#fff",
        }}
      >
        <Typography
          variant="h5"
          mb={4}
          fontWeight={700}
          sx={{ letterSpacing: 1 }}
        >
          Select Registration Type
        </Typography>

        {/* Hospital Button */}
        <MotionButton
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          fullWidth
          variant="contained"
          sx={{
            mb: 3,
            py: 1.3,
            borderRadius: 3,
            fontWeight: 600,
            background: "linear-gradient(90deg,#9333ea,#7c3aed)",
            boxShadow: "0px 4px 20px rgba(124,58,237,0.4)",
          }}
          onClick={() => navigate("/register")}
        >
          Hospital / Admin
        </MotionButton>

        {/* Pharmacy Button */}
        <MotionButton
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          fullWidth
          variant="contained"
          sx={{
            py: 1.3,
            borderRadius: 3,
            fontWeight: 600,
            background: "linear-gradient(90deg,#06b6d4,#3b82f6)",
            boxShadow: "0px 4px 20px rgba(59,130,246,0.4)",
          }}
          onClick={() => navigate("/register-pharmacy")}
        >
          Pharmacy / Shopkeeper
        </MotionButton>
      </MotionPaper>
    </Box>
  );
};

export default RegisterRole;