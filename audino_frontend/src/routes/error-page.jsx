import React from "react";

export default class ErrorBoundary extends React.Component {

  // Constructor for initializing Variables etc in a state
  // Just similar to initial line of useState if you are familiar 
  // with Functional Components
  constructor(props) {
    super(props);
    this.state = { error: null, errorInfo: null };
  }

  // This method is called if any error is encountered
  componentDidCatch(error, errorInfo) {

    // Catch errors in any components below and
    // re-render with error message
    this.setState({
      error: error,
      errorInfo: errorInfo
    })

    // You can also log error messages to an error
    // reporting service here
  }

  // This will render this component wherever called
  render() {
    if (this.state.errorInfo) {

      // Error path
      return (
        <main
          className="grid min-h-screen place-items-center bg-white px-6 py-24 sm:py-32 lg:px-8 bg-primary-background bg-center bg-no-repeat bg-cover"
          id="error-page"
        >
          <div className="text-center">
            <p className="text-base font-semibold text-audino-primary-dark">OOOPS!</p>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              An Error Has Occurred
            </h1>
            <p className="mt-6 text-base leading-7 text-gray-600">
              Sorry, Please try again.
            </p>

            <div className="mt-10 flex items-center justify-center gap-x-6">
              <details>
                {this.state.error && this.state.error.toString()}
                <br />
                {this.state.errorInfo.componentStack}
              </details>
            </div>
          </div>
        </main>

      );
    }
    // Normally, just render children, i.e. in 
    // case no error is Found
    return this.props.children;
  }
}

