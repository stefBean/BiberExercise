/* A builder class to simplify the task of creating HTML elements */
class ElementCreator {
    constructor(tag) {
        this.element = document.createElement(tag);
    }

    id(id) {
        this.element.id = id;
        return this;
    }

    class(clazz) {
        this.element.class = clazz;
        return this;
    }

    text(content) {
        this.element.innerHTML = content;
        return this;
    }

    with(name, value) {
        this.element.setAttribute(name, value)
        return this;
    }

    listener(name, listener) {
        this.element.addEventListener(name, listener)
        return this;
    }

    append(child) {
        child.appendTo(this.element);
        return this;
    }

    prependTo(parent) {
        parent.prepend(this.element);
        return this.element;
    }

    appendTo(parent) {
        parent.append(this.element);
        return this.element;
    }

    insertBefore(parent, sibling) {
        parent.insertBefore(this.element, sibling);
        return this.element;
    }

    replace(parent, sibling) {
        parent.replaceChild(this.element, sibling);
        return this.element;
    }
}

/* A class representing a resource. This class is used per default when receiving the
   available resources from the server (see end of this file).
   You can (and probably should) rename this class to match with whatever name you
   used for your resource on the server-side.
 */
class Student {

    /* If you want to know more about this form of getters, read this:
     * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get */
    get idforDOM() {
        return `resource-${this.id}`;
    }

}

function add(resource, sibling) {

    const creator = new ElementCreator("article")
        .id(resource.idforDOM);

    /* Task 2: Instead of the name property of the example resource, add the properties of
       your resource to the DOM. If you do not have the name property in your resource,
       start by removing the h2 element that currently represents the name. For the 
       properties of your object you can use whatever html element you feel represents
       your data best, e.g., h2, paragraphs, spans, ... 
       Also, you don't have to use the ElementCreator if you don't want to and add the
       elements manually. */

    creator
        .append(new ElementCreator("h2").text(resource.name))
        .append(new ElementCreator("p").text(`Age: ${resource.age}`))
        .append(new ElementCreator("p").text(`Graduated: ${resource.isGraduated}`))
        .append(new ElementCreator("p").text(`Birthdate: ${resource.birthDate}`));

    creator
        .append(new ElementCreator("button").text("Edit").listener('click', () => {
            edit(resource);
        }))
        .append(new ElementCreator("button").text("Remove").listener('click', () => {
            /* Task 3: Call the delete endpoint asynchronously using either an XMLHttpRequest
               or the Fetch API. Once the call returns successfully, remove the resource from
               the DOM using the call to remove(...) below. */
            fetch(`/api/resources/${resource.id}`,
                { method: 'DELETE' })
                .then(response =>
                    response.status === 204 ? remove(resource) : alert("Resource could not be deleted.")
                )
                .catch(() => alert("Resource could not be deleted."));
            //remove(resource);  // <- This call removes the resource from the DOM. Call it after (and only if) your API call succeeds!
        }));

    const parent = document.querySelector('main');

    if (sibling) {
        creator.replace(parent, sibling);
    } else {
        creator.insertBefore(parent, document.querySelector('#bottom'));
    }
}

function edit(resource) {
    const formCreator = new ElementCreator("form")
        .id(resource.idforDOM)
        .append(new ElementCreator("h3").text("Edit " + resource.name));
    
    /* Task 4 - Part 1: Instead of the name property, add the properties your resource has here!
       The label and input element used here are just an example of how you can edit a
       property of a resource, in the case of our example property name this is a label and an
       input field. Also, we assign the input field a unique id attribute to be able to identify
       it easily later when the user saves the edited data (see Task 4 - Part 2 below). 
    */

    formCreator
        .append(new ElementCreator("label").text("Name").with("for", "resource-name"))
        .append(new ElementCreator("input").id("resource-name").with("type", "text").with("value", resource.name))
        .append(new ElementCreator("label").text("Age").with("for", "resource-age"))
        .append(new ElementCreator("input").id("resource-age").with("type", "number").with("value", resource.age))
        .append(new ElementCreator("label").text("Graduated").with("for", "resource-isGraduated"))
        .append(new ElementCreator("input").id("resource-isGraduated").with("type", "checkbox").with("checked", resource.isGraduated))
        .append(new ElementCreator("label").text("Birthday").with("for", "resource-birthDate"))
        .append(new ElementCreator("input").id("resource-birthDate").with("type", "date").with("value", resource.birthDate));

    /* In the end, we add the code to handle saving the resource on the server and terminating edit mode */
    formCreator
        .append(new ElementCreator("button").text("Speichern").listener('click', (event) => {
            /* Why do we have to prevent the default action? Try commenting this line. */
            event.preventDefault();

            /* The user saves the resource.
               Task 4 - Part 2: We manually set the edited values from the input elements to the resource object. 
               Again, this code here is just an example of how the name of our example resource can be obtained
               and set in to the resource. The idea is that you handle your own properties here.
            */
            resource.name = document.getElementById("resource-name").value;
            resource.age = document.getElementById("resource-age").value;
            resource.isGraduated = document.getElementById("resource-isGraduated").checked;
            resource.birthDate = document.getElementById("resource-birthDate").value;

            /* Task 4 - Part 3: Call the update endpoint asynchronously. Once the call returns successfully,
               use the code below to remove the form we used for editing and again render 
               the resource in the list.
            */

            /*           fetch(`/api/resources/${resource.id}`,
                           { method: 'PUT',
                               headers: {
                                   'Content-Type': 'application/json'
                               },
                               body: JSON.stringify(resource)
                           })
                           .then(response =>
                               response.status === 204 ? add(resource, document.getElementById(resource.idforDOM)) : alert("Resource could not be saved.")
                           )
                           .catch(() => alert("Resource can't be saved."));
            */

                       fetch(`/api/resources/${resource.id}`, {
                           method: 'PUT',
                           headers: {
                               'Content-Type': 'application/json'
                           },
                           body: JSON.stringify(resource)
                       }).then(updatedResource => {
                           remove(resource);
                           add(resource, document.getElementById(resource.idforDOM));  // <- Call this after the resource is updated successfully on the server
                       }).catch(() => alert("Resource could not be saved."));



        }))
        .replace(document.querySelector('main'), document.getElementById(resource.idforDOM));
}

function remove(resource) {
    document.getElementById(resource.idforDOM).remove();
}

/* Task 5 - Create a new resource is very similar to updating a resource. First, you add
   an empty form to the DOM with the exact same fields you used to edit a resource.
   Instead of PUTing the resource to the server, you POST it and add the resource that
   the server returns to the DOM (Remember, the resource returned by the server is the
    one that contains an id).
 */
function create() {

    const resource = new Student();
    const formCreator = new ElementCreator("article")
        .append(new ElementCreator("h3").text("Create New Student"));

    formCreator
        .append(new ElementCreator("label").text("Name").with("for", "resource-name"))
        .append(new ElementCreator("input").id("resource-name").with("type", "text"))
        .append(new ElementCreator("label").text("Age").with("for", "resource-age"))
        .append(new ElementCreator("input").id("resource-age").with("type", "number"))
        .append(new ElementCreator("label").text("Graduated").with("for", "resource-isGraduated"))
        .append(new ElementCreator("input").id("resource-isGraduated").with("type", "checkbox"))
        .append(new ElementCreator("label").text("Birthday").with("for", "resource-birthDate"))
        .append(new ElementCreator("input").id("resource-birthDate").with("type", "date"));

    formCreator
    .append(new ElementCreator("button").text("Create").listener('click', (event) => {
            event.preventDefault();

            resource.name = document.getElementById("resource-name").value;
            resource.age = document.getElementById("resource-age").value;
            resource.isGraduated = document.getElementById("resource-isGraduated").checked;
            resource.birthDate = document.getElementById("resource-birthDate").value;

            fetch('/api/resources', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(resource)
            }).then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error("Error creating student.");
                }
            }).then(newResource => {
                add(Object.assign(new Student(), newResource));
            }).catch(() => alert("Error creating student."));
    }));

    const parent = document.querySelector('main');
    formCreator.prependTo(parent);

}



document.addEventListener("DOMContentLoaded", function (event) {

    fetch("/api/resources")
        .then(response => response.json())
        .then(resources => {
            for (const resource of resources) {
                add(Object.assign(new Student(), resource));
            }
        });
});

