<?php
include("header.php");
include "db_connect.php";
include("checkregistrationerror.php");
?>

<!DOCTYPE html>
<html>
<head>
    <title>Registration Form</title>

    <style>
        body{
            font-family: Arial, sans-serif;
            margin:40px;
        }

        form{
            max-width:400px;
            margin:auto;
            padding:20px;
            border:1px solid #ccc;
            border-radius:8px;
        }

        label{
            display:block;
            margin-top:10px;
        }

        input,select{
            width:100%;
            padding:8px;
            margin-top:5px;
            box-sizing:border-box;
        }

        button{
            margin-top:15px;
            padding:10px;
            width:100%;
            background:#4CAF50;
            color:white;
            border:none;
            border-radius:5px;
            cursor:pointer;
        }

        button:hover{
            background:#45a049;
        }

        h2{
            text-align:center;
        }
    </style>
</head>

<body>

<h2>Registration Form</h2>

<form  method="POST">

    <label>Full Name</label>
    <input type="text" name="fullname" required>

    <label>Email</label>
    <input type="email" name="email" required>

    <label>Password</label>
    <input type="password" name="password" required>

    <label>Gender</label>
    <select name="gender" required>
        <option value="">Select...</option>
        <option value="Male">Male</option>
        <option value="Female">Female</option>
        <option value="Other">Other</option>
    </select>

    <label>Date of Birth</label>
    <input type="date" name="dob" required>

    <button type="submit" name="register">Register</button>

</form>

</body>
</html>

<?php
include("footer.php");
?>