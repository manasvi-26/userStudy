function submitForm(){
	$('#userform').submit(function(e) {
		e.preventDefault();
		submitUserDetails();
	});
}
console.log("hi")
window.onload = submitForm;

function submitUserDetails() {
    console.log("i got called")
	name = $('#name').val();
	age = $('#age').val();
	aff = $('#affiliation').val();
	gender = $('#gender').val();
	console.log(name, age)
	if(name == "" || age == ""){
		alert("Please Fill All The Required Details")
		return
	}
    
    $.ajax({
        url : 'addNewUser',
		type: 'POST',
        data: {
			'name': name,
			'age': age,
			'affiliation': aff,
			'gender': gender,
		},
		success: function(response){
			window.location=response;
		},
		error: function(response){
		}
    })
}