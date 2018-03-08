let a = 1;
var b = 2;

$('#list').html(`
<ul>
  <li>first:${b}</li>
  <li>second:${a + b}</li>
</ul>
`.trim());

var list = (a, b) => {
    return a + b;
};