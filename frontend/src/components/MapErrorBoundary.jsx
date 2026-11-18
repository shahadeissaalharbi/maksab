import { Component } from "react";

// هنا لو صار خطأ داخل الخريطة التفاعلية نعرض البديل بدل ما تنكسر الصفحة
class MapErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

export default MapErrorBoundary;