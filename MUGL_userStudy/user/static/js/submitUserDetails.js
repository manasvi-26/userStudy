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