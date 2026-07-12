<!DOCTYPE html>
<html>
<head>
    <title>Student Registration Form</title>
</head>
<body>

<h2>Student Registration</h2>

<?php
$errors = [];

if(isset($_POST['submit']))
{
    $email = $_POST['email'];
    $phone = $_POST['phone'];

    // Email Validation
    if(!filter_var($email, FILTER_VALIDATE_EMAIL))
    {
        $errors[] = "Please enter a valid email address.";
    }

    // Phone Validation
    if(!is_numeric($phone))
    {
        $errors[] = "Phone number should contain only digits.";
    }
    else if(strlen($phone) != 10)
    {
        $errors[] = "Phone number must be exactly 10 digits.";
    }

    // Photo Validation
    if(isset($_FILES['photo']) && $_FILES['photo']['error'] == 0)
    {
        $allowed = array("jpg", "jpeg", "png", "gif");

        $filename = $_FILES["photo"]["name"];
        $filesize = $_FILES["photo"]["size"];
        $filetmp = $_FILES["photo"]["tmp_name"];

        $ext = strtolower(pathinfo($filename, PATHINFO_EXTENSION));

        // Check file type
        if(!in_array($ext, $allowed))
        {
            $errors[] = "Only JPG, JPEG, PNG and GIF files are allowed.";
        }

        // Check file size (2MB Maximum)
        if($filesize > 2 * 1024 * 1024)
        {
            $errors[] = "Photo size must be less than 2 MB.";
        }

        // Upload Photo
        if(empty($errors))
        {
            // Create uploads folder if it doesn't exist
            if(!is_dir("uploads"))
            {
                mkdir("uploads");
            }

            $newname = time() . "_" . basename($filename);
            $target = "uploads/" . $newname;

            if(move_uploaded_file($filetmp, $target))
            {
                echo "<h3 style='color:green;'>Form Submitted Successfully!</h3>";
                echo "<p><strong>Email:</strong> $email</p>";
                echo "<p><strong>Phone:</strong> $phone</p>";
                echo "<p><strong>Uploaded Photo:</strong></p>";
                echo "<img src='$target' width='200' height='200'>";
            }
            else
            {
                $errors[] = "Photo upload failed.";
            }
        }
    }
    else
    {
        $errors[] = "Please upload a photo.";
    }
}
?>

<!-- Display Errors -->
<?php
if(!empty($errors))
{
    echo "<ul style='color:red;'>";
    foreach($errors as $error)
    {
        echo "<li>$error</li>";
    }
    echo "</ul>";
}
?>

<form method="post" enctype="multipart/form-data">

    <label>Email:</label><br>
    <input type="text" name="email"><br><br>

    <label>Phone:</label><br>
    <input type="text" name="phone"><br><br>

    <label>Upload Photo:</label><br>
    <input type="file" name="photo" accept=".jpg,.jpeg,.png,.gif"><br><br>

    <input type="submit" name="submit" value="Submit">

</form>

</body>
</html>