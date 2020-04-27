import React from "react";

class AnnotationFile extends React.Component {

}

class AnnotationListing extends React.Component {
  render() {
    return (<div class="row h-100 justify-content-center align-items-center">
      <div class="col-12 justify-content-left">
        <ul class="nav nav-pills">
          <li class="nav-item">
            <a
              class="nav-link {% if active == 'pending' %} active {% endif %}"
              href="{{ url_for('routes.dashboard', active='pending') }}"
            >
              Pending ({{ count_data['pending'] }})
            </a>
          </li>
          <li class="nav-item">
            <a
              class="nav-link {% if active == 'completed' %} active {% endif %}"
              href="{{ url_for('routes.dashboard', active='completed') }}"
            >
              Completed ({{ count_data['completed'] }})
            </a>
          </li>
          <li class="nav-item">
            <a
              class="nav-link {% if active == 'all' %} active {% endif %}"
              href="{{ url_for('routes.dashboard', active='all') }}"
            >
              All ({{ count_data['all'] }})
            </a>
          </li>
          <li class="nav-item">
              <a
                class="nav-link {% if active == 'marked_review' %} active {% endif %}"
                href="{{ url_for('routes.dashboard', active='marked_review') }}"
              >
                Marked for review ({{ count_data['marked_review'] }})
              </a>
            </li>
        </ul>
      </div>
      <div class="w-100"></div>
      {% if message %}
      <h1>{{ message }}</h1>
      {% else %}
      <div class="col-12">
        <table class="table margin-25">
          <thead>
            <tr>
              <th scope="col">File</th>
              <th scope="col">Marked for review</th>
            </tr>
          </thead>
          <tbody>
            {% for audio in audio_data %}
            <tr>
              <td>
                <a href="{{ url_for('routes.annotation', file=audio.id) }}">
                  {{ audio.file_name }}
                </a>
              </td>
              <td>
                {{ 'Yes' if audio.marked_review else 'No' }}
              </td>
            </tr>
            {% endfor %}
          </tbody>
        </table>
      </div>
      <div class="w-100"></div>
      <div class="col-12">
        {% if prev_url %}
        <a class="col" href="{{ prev_url }}">
          Previous
        </a>
        {% endif %}
        <span class="col">{{ page }}</span>
        {% if next_url %}
        <a class="col" href="{{ next_url }}">
          Next
        </a>
        {% endif %}
      </div>
      {% endif %}
    </div>)
  }
}

export default AnnotationListing;
