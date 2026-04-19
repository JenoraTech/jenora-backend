// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, clearance } = req.body;

    // 1. Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res
        .status(400)
        .json({ message: "User already registered in cloud." });
    }

    // 2. Create the user (Ensure your User model has these fields)
    const newUser = await User.create({
      name,
      email,
      password, // Your User model should have a pre-save hook to hash this!
      role,
      clearance,
    });

    res.status(201).json({
      message: "User provisioned successfully",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Server error during registration",
        error: error.message,
      });
  }
};
