from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0011_merge_20260404_0256"),
    ]

    operations = [
        migrations.AddField(
            model_name="book",
            name="listing_type",
            field=models.CharField(default="standard", max_length=20),
        ),
    ]
