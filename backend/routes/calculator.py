from decimal import Decimal, ROUND_HALF_UP

from flask import Blueprint, jsonify, request

from decorators import token_required

calculator_bp = Blueprint("calculator", __name__)

CENT = Decimal("0.01")


def to_number(value):
    """Return a finite Decimal, or None for missing, bool, text or NaN."""
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        return None
    number = Decimal(str(value))
    return number if number.is_finite() else None


def money(value):
    return float(value.quantize(CENT, rounding=ROUND_HALF_UP))


@calculator_bp.route("/api/calculator/price", methods=["POST"])
@token_required
def calculate_price():
    if request.user_role != "merchant":
        return jsonify({"error": "Access denied"}), 403

    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({"error": "Invalid data"}), 400

    material = to_number(data.get("material"))
    packaging = to_number(data.get("packaging"))
    labor = to_number(data.get("labor"))
    quantity = to_number(data.get("quantity"))
    margin = to_number(data.get("margin"))

    if None in (material, packaging, labor, quantity, margin):
        return jsonify({"error": "All fields must be valid numbers"}), 400
    if min(material, packaging, labor) < 0:
        return jsonify({"error": "Costs cannot be negative"}), 400
    if quantity <= 0:
        return jsonify({"error": "Quantity must be greater than 0"}), 400
    if margin < 0 or margin >= 100:
        return jsonify({"error": "Margin must be below 100"}), 400

    total_cost = material + packaging + labor
    unit_cost = total_cost / quantity
    price = unit_cost / (1 - margin / 100)

    cost_per_unit = money(unit_cost)
    suggested_price = money(price)

    return jsonify({
        "total_cost": money(total_cost),
        "cost_per_unit": cost_per_unit,
        "suggested_price": suggested_price,
        "profit_per_unit": round(suggested_price - cost_per_unit, 2),
    }), 200
