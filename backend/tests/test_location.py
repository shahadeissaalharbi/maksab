import unittest
from routes.location import is_valid_location, location_json


class TestLocation(unittest.TestCase):

    def test_valid_coordinates(self):
        self.assertTrue(is_valid_location(24.7136, 46.6753))
        self.assertTrue(is_valid_location(-90, 180))
        self.assertTrue(is_valid_location(0, 0))

    def test_invalid_coordinates(self):
        invalid_locations = [
            (100, 46),
            (24, 200),
            (None, 46),
            (24, None),
            (True, 46),
            ("abc", 46),
            (float("nan"), 46),
            (24, float("inf")),
        ]

        for latitude, longitude in invalid_locations:
            with self.subTest(latitude=latitude, longitude=longitude):
                self.assertFalse(
                    is_valid_location(latitude, longitude)
                )

    def test_location_json(self):
        self.assertEqual(
            location_json(24.7136, 46.6753),
            {"latitude": 24.7136, "longitude": 46.6753},
        )
        self.assertIsNone(location_json(None, None))

from unittest.mock import patch, MagicMock
import jwt
from datetime import datetime, timedelta, timezone

from app import app
from config import Config


class TestLocationAPI(unittest.TestCase):

    def setUp(self):
        self.client = app.test_client()

        self.secret_patcher = patch.object(
            Config, "JWT_SECRET", "location-test-secret-for-unit-testing-only-2026"
        )
        self.secret_patcher.start()

        self.db_url_patcher = patch.object(
            Config, "DATABASE_URL", "postgresql://mock-db"
        )
        self.db_url_patcher.start()

        self.token = jwt.encode(
            {
                "sub": "1",
                "role": "merchant",
                "exp": datetime.now(timezone.utc) + timedelta(hours=1),
            },
            Config.JWT_SECRET,
            algorithm=Config.JWT_ALGORITHM,
        )

        self.headers = {
            "Authorization": f"Bearer {self.token}"
        }

    def tearDown(self):
        self.secret_patcher.stop()
        self.db_url_patcher.stop()

    @patch("routes.location.psycopg.connect")
    def test_get_location(self, mock_connect):
        mock_cursor = MagicMock()
        mock_cursor.fetchone.return_value = (24.7136, 46.6753)

        mock_connect.return_value.__enter__.return_value.cursor.return_value.__enter__.return_value = mock_cursor

        response = self.client.get(
            "/api/users/location",
            headers=self.headers,
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.get_json()["location"],
            {"latitude": 24.7136, "longitude": 46.6753},
        )

        mock_cursor.execute.assert_called_once_with(
            unittest.mock.ANY,
            (1,),
        )

    @patch("routes.location.psycopg.connect")
    def test_put_location(self, mock_connect):
        mock_cursor = MagicMock()
        mock_cursor.fetchone.return_value = (24.7136, 46.6753)

        mock_connect.return_value.__enter__.return_value.cursor.return_value.__enter__.return_value = mock_cursor

        response = self.client.put(
            "/api/users/location",
            headers=self.headers,
            json={
                "latitude": 24.7136,
                "longitude": 46.6753,
            },
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.get_json()["location"],
            {"latitude": 24.7136, "longitude": 46.6753},
        )

        mock_cursor.execute.assert_called_once_with(
            unittest.mock.ANY,
            (24.7136, 46.6753, 1),
        )

    @patch("routes.location.psycopg.connect")
    def test_reject_invalid_location(self, mock_connect):
        response = self.client.put(
            "/api/users/location",
            headers=self.headers,
            json={
                "latitude": 150,
                "longitude": 300,
            },
        )

        self.assertEqual(response.status_code, 400)
        mock_connect.assert_not_called()



if __name__ == "__main__":
    unittest.main()
