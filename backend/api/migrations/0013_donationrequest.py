from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0012_book_listing_type"),
    ]

    operations = [
        migrations.CreateModel(
            name="DonationRequest",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("requester", models.CharField(max_length=100)),
                ("status", models.CharField(default="pending", max_length=20)),
                ("book", models.ForeignKey(on_delete=models.deletion.CASCADE, to="api.book")),
            ],
        ),
    ]
